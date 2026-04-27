"use client";

import { useState } from "react";

import { OpenMetadataIcon } from "@/components/openmetadata-icon";
import { ResultPanel } from "@/components/result-panel";
import { SchemaPanel } from "@/components/schema-panel";

type WorkflowEndpoint = "/api/workflows/read" | "/api/workflows/write";

type WorkflowPreset = {
  name: string;
  eyebrow: string;
  endpoint: WorkflowEndpoint;
  payload: Record<string, unknown>;
  description: string;
};

const workflowPresets: WorkflowPreset[] = [
  {
    name: "PII impact report",
    eyebrow: "Copilot",
    endpoint: "/api/workflows/read",
    description:
      "Search for PII tables, inspect the strongest matches, fetch lineage, and return a steward-readable impact brief.",
    payload: {
      workflow: "piiImpactReport",
      query: "customer pii",
      entityType: "table",
      limit: 5,
      maxEntities: 3,
      upstreamDepth: 1,
      downstreamDepth: 2,
      fallbackFqn: "acme_nexus_raw_data.acme_raw.crm.customers",
    },
  },
  {
    name: "Search customer PII",
    eyebrow: "Step 1",
    endpoint: "/api/workflows/read",
    description: "Find candidate tables through the documented search_metadata tool.",
    payload: {
      workflow: "search",
      query: "customer pii",
      entityType: "table",
      limit: 5,
    },
  },
  {
    name: "Inspect impact",
    eyebrow: "Step 2",
    endpoint: "/api/workflows/read",
    description:
      "Fetch entity details and lineage together for impact analysis before a governance change.",
    payload: {
      workflow: "impact",
      entityType: "table",
      fqn: "acme_nexus_raw_data.acme_raw.crm.customers",
      upstreamDepth: 2,
      downstreamDepth: 2,
    },
  },
  {
    name: "Inspect extension schema",
    eyebrow: "Step 3",
    endpoint: "/api/workflows/write",
    description:
      "Inspect how governed actions are enabled only after tool-schema discovery.",
    payload: {
      workflow: "inspectToolSchema",
      toolName: "create_test_case",
    },
  },
];

const initialPreset = workflowPresets[0];

function stringifyPayload(payload: Record<string, unknown>) {
  return JSON.stringify(payload, null, 2);
}

function extractSchema(response: unknown) {
  if (
    typeof response !== "object" ||
    response === null ||
    !("result" in response)
  ) {
    return null;
  }

  const result = (response as { result?: unknown }).result;
  if (
    typeof result === "object" &&
    result !== null &&
    "toolName" in result &&
    "schema" in result
  ) {
    return {
      title: `Schema for ${(result as { toolName: string }).toolName}`,
      schema: (result as { schema: unknown }).schema,
    };
  }

  return null;
}

function extractSummary(response: unknown) {
  if (
    typeof response !== "object" ||
    response === null ||
    !("result" in response)
  ) {
    return null;
  }

  const result = (response as { result?: unknown }).result;
  if (
    typeof result === "object" &&
    result !== null &&
    "summary" in result &&
    typeof (result as { summary?: unknown }).summary === "string"
  ) {
    return (result as { summary: string }).summary;
  }

  return null;
}

function extractWorkflowResult(response: unknown) {
  if (
    typeof response !== "object" ||
    response === null ||
    !("result" in response)
  ) {
    return null;
  }

  const result = (response as { result?: unknown }).result;
  if (typeof result === "object" && result !== null) {
    return result as Record<string, unknown>;
  }

  return null;
}

function resolveCopilotPreset(prompt: string) {
  const normalizedPrompt = prompt.toLowerCase();
  const piiImpactPreset = workflowPresets.find(
    (preset) => preset.name === "PII impact report",
  );

  if (
    piiImpactPreset &&
    normalizedPrompt.includes("pii") &&
    (normalizedPrompt.includes("impact") ||
      normalizedPrompt.includes("lineage") ||
      normalizedPrompt.includes("downstream") ||
      normalizedPrompt.includes("report"))
  ) {
    return {
      preset: piiImpactPreset,
      reply:
        "Built a PII impact report workflow: search_metadata -> get_entity_details -> get_entity_lineage -> human-readable summary.",
    };
  }

  if (normalizedPrompt.includes("schema") || normalizedPrompt.includes("capability")) {
    return {
      preset: workflowPresets.find((preset) => preset.name === "Inspect extension schema"),
      reply:
        "Mapped that to the schema inspection workflow so the server can verify MCP tool capabilities before writes.",
    };
  }

  return {
    preset: workflowPresets.find((preset) => preset.name === "Search customer PII"),
    reply:
      "Mapped that to metadata search. Add words like downstream, lineage, impact, or report for the full PII impact report.",
  };
}

export function WorkflowShell() {
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [payload, setPayload] = useState(() =>
    stringifyPayload(initialPreset.payload),
  );
  const [copilotPrompt, setCopilotPrompt] = useState(
    "Find PII tables and show downstream impact",
  );
  const [copilotReply, setCopilotReply] = useState(
    "Ask the copilot to translate a stewardship goal into one of the supported workflow payloads.",
  );
  const [result, setResult] = useState<unknown>({
    ok: true,
    message: "Choose a workflow preset, adjust the JSON if needed, then run it.",
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  function choosePreset(preset: WorkflowPreset) {
    setSelectedPreset(preset);
    setPayload(stringifyPayload(preset.payload));
  }

  function applyCopilotPrompt() {
    const trimmedPrompt = copilotPrompt.trim();
    if (!trimmedPrompt) {
      setCopilotReply("Enter a stewardship goal and I will build a workflow payload.");
      return;
    }

    const suggestion = resolveCopilotPreset(trimmedPrompt);
    if (!suggestion.preset) {
      setCopilotReply("I could not map that request to a supported workflow yet.");
      return;
    }

    choosePreset(suggestion.preset);
    setCopilotReply(suggestion.reply);
  }

  async function synthesizePiiReport(responseBody: unknown) {
    const workflowResult = extractWorkflowResult(responseBody);
    if (workflowResult?.workflow !== "piiImpactReport") {
      return responseBody;
    }

    setIsSynthesizing(true);
    try {
      const response = await fetch("/api/ai/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userGoal: copilotPrompt,
          workflowResult,
        }),
      });
      const contentType = response.headers.get("content-type") ?? "";
      const synthesisBody = contentType.includes("application/json")
        ? await response.json()
        : { ok: false, error: await response.text() };
      const synthesisResult = extractWorkflowResult(synthesisBody);

      if (
        response.ok &&
        synthesisResult &&
        typeof synthesisResult.summary === "string"
      ) {
        return {
          ...(responseBody as Record<string, unknown>),
          result: {
            ...workflowResult,
            aiModel: synthesisResult.model,
            summary: synthesisResult.summary,
            templatedSummary: workflowResult.summary,
          },
        };
      }

      return {
        ...(responseBody as Record<string, unknown>),
        result: {
          ...workflowResult,
          aiSynthesisError:
            typeof synthesisBody === "object" &&
            synthesisBody !== null &&
            "error" in synthesisBody
              ? (synthesisBody as { error: unknown }).error
              : "AI synthesis did not return a summary.",
        },
      };
    } catch (error) {
      return {
        ...(responseBody as Record<string, unknown>),
        result: {
          ...workflowResult,
          aiSynthesisError:
            error instanceof Error
              ? error.message
              : "AI synthesis failed before reaching the server.",
        },
      };
    } finally {
      setIsSynthesizing(false);
    }
  }

  async function runWorkflow() {
    setIsRunning(true);

    try {
      JSON.parse(payload);
    } catch {
      setResult({
        ok: false,
        code: "invalid_json",
        error: "The payload editor must contain valid JSON before running.",
      });
      setIsRunning(false);
      return;
    }

    try {
      const response = await fetch(selectedPreset.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      const contentType = response.headers.get("content-type") ?? "";
      const responseBody = contentType.includes("application/json")
        ? await response.json()
        : { ok: false, error: await response.text() };

      setResult(responseBody);
      setIsRunning(false);
      setResult(await synthesizePiiReport(responseBody));
    } catch (error) {
      setResult({
        ok: false,
        code: "request_failed",
        error:
          error instanceof Error
            ? error.message
            : "The workflow request failed before reaching the server.",
      });
    } finally {
      setIsRunning(false);
    }
  }

  const inspectedSchema = extractSchema(result);
  const summary = extractSummary(result);

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
      <div className="relative mx-auto max-w-7xl">
        <header className="mb-5 flex flex-col gap-3 rounded-[24px] border border-slate-950/10 bg-white/75 p-3 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-slate-950/10 bg-white">
              <OpenMetadataIcon size={30} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                Workspace
              </p>
              <h1 className="font-heading text-xl font-semibold tracking-tight text-slate-950">
                Steward Copilot
              </h1>
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[28px] border border-slate-950/10 bg-white/85 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
            <h2 className="font-heading text-lg font-semibold">
              Copilot
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Describe the stewardship outcome. The copilot converts it into a
              supported workflow payload you can inspect before running.
            </p>
            <div className="mt-4 rounded-[20px] border border-[#F04D26]/20 bg-[#fff7f3] p-4">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="copilot-prompt"
              >
                Prompt
              </label>
              <textarea
                className="mt-2 min-h-24 w-full rounded-[16px] border border-slate-950/10 bg-white p-3 text-sm leading-relaxed text-slate-900 outline-none ring-[#F04D26]/30 transition placeholder:text-slate-400 focus:ring-2"
                id="copilot-prompt"
                onChange={(event) => setCopilotPrompt(event.target.value)}
                placeholder="Find PII tables and show downstream impact"
                value={copilotPrompt}
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  className="rounded-[13px] bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  onClick={applyCopilotPrompt}
                  type="button"
                >
                  Build workflow
                </button>
                <p className="text-sm text-slate-600">{copilotReply}</p>
              </div>
            </div>

            <h2 className="mt-6 font-heading text-lg font-semibold">
              Workflow Presets
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Or pick a preset directly, adjust the payload, then run it against
              the connected MCP tools.
            </p>
            <div className="mt-5 space-y-3">
              {workflowPresets.map((preset) => {
                const isSelected = preset.name === selectedPreset.name;

                return (
                  <button
                    className={`w-full rounded-[18px] border p-4 text-left transition ${
                      isSelected
                        ? "border-[#F04D26]/50 bg-[#F04D26]/5 shadow-sm"
                        : "border-slate-950/10 bg-white/80 hover:border-[#F04D26]/30"
                    }`}
                    key={preset.name}
                    onClick={() => choosePreset(preset)}
                    type="button"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#F04D26]">
                      {preset.eyebrow}
                    </span>
                    <span className="mt-1 block font-semibold">
                      {preset.name}
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">
                      {preset.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-950/10 bg-white/85 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {selectedPreset.endpoint}
                </p>
                <h2 className="mt-1 font-heading text-2xl font-semibold">
                  {selectedPreset.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedPreset.description}
                </p>
              </div>
              <button
                className="rounded-[13px] bg-[#F04D26] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#F04D26]/20 transition hover:bg-[#de4723] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isRunning || isSynthesizing}
                onClick={runWorkflow}
                type="button"
              >
                {isRunning
                  ? "Running..."
                  : isSynthesizing
                    ? "Synthesizing..."
                    : "Run workflow"}
              </button>
            </div>

            <label
              className="mt-5 block text-sm font-medium text-slate-700"
              htmlFor="workflow-payload"
            >
              Editable workflow payload
            </label>
            <textarea
              className="mt-2 min-h-80 w-full rounded-[18px] border border-slate-950/10 bg-[#151515] p-4 font-mono text-sm leading-relaxed text-slate-50 shadow-inner outline-none ring-[#F04D26]/40 transition focus:ring-2"
              id="workflow-payload"
              onChange={(event) => setPayload(event.target.value)}
              spellCheck={false}
              value={payload}
            />
          </section>
        </div>

        <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <ResultPanel
            renderMarkdown={Boolean(summary)}
            result={summary ?? result}
            title={summary ? "Copilot Summary" : "MCP Output"}
          />
          {inspectedSchema ? (
            <SchemaPanel
              schema={inspectedSchema.schema}
              title={inspectedSchema.title}
            />
          ) : (
            <section className="rounded-[22px] border border-slate-950/10 bg-white/85 p-5 text-slate-700 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Capability Guardrail
              </h2>
              <p className="mt-2 text-sm">
                The server probes `tools/list`, caches tool schemas, and blocks
                workflows when the target instance does not expose the required
                MCP tool.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
