import { createOpenAI, type OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";

const MODEL_ID = "gpt-5.4-mini";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const MAX_PROMPT_CHARS = 14_000;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

const reportSchema = z.object({
  fqn: z.string().max(300),
  detailsText: z.string().max(25_000).optional(),
  lineageText: z.string().max(25_000).optional(),
});

const synthesizeRequestSchema = z.object({
  userGoal: z.string().max(600).optional(),
  workflowResult: z.object({
    workflow: z.string().optional(),
    summary: z.string().max(8_000).optional(),
    candidateFqns: z.array(z.string().max(300)).max(50).optional(),
    reports: z.array(reportSchema).max(3).optional(),
  }),
});

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    forwardedIp ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "local"
  );
}

function checkRateLimit(clientKey: string) {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  const existing = rateLimitStore.get(clientKey);
  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(clientKey, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return null;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return Math.ceil((existing.resetAt - now) / 1000);
  }

  existing.count += 1;
  return null;
}

function getOpenAIKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("Missing required env var: OPENAI_API_KEY");
  }

  return key;
}

function compactForPrompt(value: z.infer<typeof synthesizeRequestSchema>) {
  const promptPayload = JSON.stringify(value, null, 2);

  if (promptPayload.length <= MAX_PROMPT_CHARS) {
    return promptPayload;
  }

  return `${promptPayload.slice(0, MAX_PROMPT_CHARS).trim()}\n...[truncated]`;
}

export async function POST(request: Request) {
  const retryAfterSeconds = checkRateLimit(getClientKey(request));
  if (retryAfterSeconds !== null) {
    return Response.json(
      {
        ok: false,
        code: "rate_limited",
        error: "Too many AI synthesis requests. Please retry shortly.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      },
    );
  }

  try {
    const parsed = synthesizeRequestSchema.parse(await request.json());
    const openai = createOpenAI({
      apiKey: getOpenAIKey(),
    });

    const result = await generateText({
      model: openai(MODEL_ID),
      system:
        "You are Steward Copilot, a concise OpenMetadata data governance assistant. " +
        "Write a human-readable PII impact report for data stewards. Use only the provided MCP evidence, do not invent owners, systems, risks, or downstream assets, and call out missing evidence plainly.",
      prompt:
        "Synthesize this workflow result into a crisp report with: executive summary, assets analyzed, downstream impact, risk notes, and recommended next action.\n\n" +
        compactForPrompt(parsed),
      maxOutputTokens: 900,
      providerOptions: {
        openai: {
          store: false,
        } satisfies OpenAIResponsesProviderOptions,
      },
    });

    return Response.json({
      ok: true,
      result: {
        model: MODEL_ID,
        summary: result.text,
        usage: result.totalUsage,
      },
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        code:
          error instanceof z.ZodError
            ? "invalid_synthesis_payload"
            : "ai_synthesis_failed",
        error:
          error instanceof Error
            ? error.message
            : "The AI synthesis request failed.",
      },
      { status: error instanceof z.ZodError ? 400 : 500 },
    );
  }
}
