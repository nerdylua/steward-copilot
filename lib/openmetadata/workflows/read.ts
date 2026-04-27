import { z } from "zod";

import { requireTools } from "@/lib/openmetadata/capabilities";
import type { ToolCapabilityMap } from "@/types/openmetadata";

export const readWorkflowSchema = z.discriminatedUnion("workflow", [
  z.object({
    workflow: z.literal("search"),
    query: z.string().min(2),
    entityType: z.string().optional(),
    limit: z.number().int().min(1).max(20).default(5),
  }),
  z.object({
    workflow: z.literal("impact"),
    entityType: z.string(),
    fqn: z.string(),
    upstreamDepth: z.number().int().min(1).max(5).default(2),
    downstreamDepth: z.number().int().min(1).max(5).default(2),
  }),
  z.object({
    workflow: z.literal("piiImpactReport"),
    query: z.string().min(2).default("customer pii"),
    entityType: z.string().default("table"),
    limit: z.number().int().min(1).max(10).default(5),
    upstreamDepth: z.number().int().min(1).max(5).default(1),
    downstreamDepth: z.number().int().min(1).max(5).default(2),
    maxEntities: z.number().int().min(1).max(3).default(3),
    fallbackFqn: z.string().optional(),
  }),
]);

function collectToolText(result: unknown): string {
  if (
    typeof result === "object" &&
    result !== null &&
    "content" in result &&
    Array.isArray((result as { content?: unknown }).content)
  ) {
    return (result as { content: Array<{ text?: unknown }> }).content
      .map((item) => (typeof item.text === "string" ? item.text : ""))
      .filter(Boolean)
      .join("\n");
  }

  return typeof result === "string" ? result : JSON.stringify(result);
}

function truncateText(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized || "No text returned by MCP.";
  }

  return `${normalized.slice(0, maxLength - 1).trim()}...`;
}

function collectStringFields(value: unknown, keys: Set<string>, output: string[]) {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectStringFields(item, keys, output));
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (keys.has(key) && typeof nestedValue === "string") {
      output.push(nestedValue);
    }

    collectStringFields(nestedValue, keys, output);
  }
}

function collectEntityFqns(value: unknown, entityType: string, output: string[]) {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectEntityFqns(item, entityType, output));
    return;
  }

  const record = value as Record<string, unknown>;
  if (
    record.entityType === entityType &&
    typeof record.fullyQualifiedName === "string"
  ) {
    output.push(record.fullyQualifiedName);
  }

  for (const nestedValue of Object.values(record)) {
    collectEntityFqns(nestedValue, entityType, output);
  }
}

function extractCandidateFqns(
  searchResult: unknown,
  entityType: string,
  fallbackFqn?: string,
): string[] {
  const candidates: string[] = [];
  const searchText = collectToolText(searchResult);

  try {
    const parsedSearch = JSON.parse(searchText);
    collectEntityFqns(parsedSearch, entityType, candidates);
    collectStringFields(
      parsedSearch,
      new Set(["fullyQualifiedName", "fqn"]),
      candidates,
    );
  } catch {
    // MCP servers may return prose or markdown instead of raw JSON.
  }

  const quotedFieldPattern = /"(?:fullyQualifiedName|fqn)"\s*:\s*"([^"]+)"/g;
  for (const match of searchText.matchAll(quotedFieldPattern)) {
    candidates.push(match[1]);
  }

  const proseFieldPattern =
    /(?:fullyQualifiedName|fqn)\s*[:=]\s*([A-Za-z0-9_.-]+\.[A-Za-z0-9_.-]+)/gi;
  for (const match of searchText.matchAll(proseFieldPattern)) {
    candidates.push(match[1].replace(/[,\]}.)]+$/, ""));
  }

  if (fallbackFqn) {
    candidates.push(fallbackFqn);
  }

  return Array.from(new Set(candidates.map((candidate) => candidate.trim()).filter(Boolean)));
}

function buildPiiImpactSummary({
  query,
  entityType,
  candidateFqns,
  reports,
}: {
  query: string;
  entityType: string;
  candidateFqns: string[];
  reports: Array<{ fqn: string; detailsText: string; lineageText: string }>;
}) {
  if (reports.length === 0) {
    return [
      "# PII Impact Report",
      "",
      `Search query: "${query}"`,
      "",
      "No table FQN could be extracted from the search results, so the assistant stopped before calling entity details or lineage.",
      candidateFqns.length > 0
        ? `Candidate identifiers seen: ${candidateFqns.join(", ")}`
        : "Add `fallbackFqn` to the payload to force an impact report for a known table.",
    ].join("\n");
  }

  const sections = reports.flatMap((report, index) => [
    `## ${index + 1}. ${report.fqn}`,
    "",
    `Asset context: ${truncateText(report.detailsText, 520)}`,
    "",
    `Downstream impact: ${truncateText(report.lineageText, 620)}`,
  ]);

  return [
    "# PII Impact Report",
    "",
    `Search query: "${query}"`,
    `Entity type: ${entityType}`,
    `Candidate assets found: ${candidateFqns.length}`,
    `Assets analyzed: ${reports.length}`,
    "",
    ...sections,
    "",
    "Recommended steward action: review downstream consumers before tagging or changing retention on the source table.",
  ].join("\n");
}

export async function runReadWorkflow(
  client: {
    callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  },
  capabilities: ToolCapabilityMap,
  input: z.input<typeof readWorkflowSchema>,
) {
  const parsed = readWorkflowSchema.parse(input);

  if (parsed.workflow === "search") {
    requireTools(capabilities, ["search_metadata"]);

    return client.callTool("search_metadata", {
      query: parsed.query,
      entityType: parsed.entityType,
      size: parsed.limit,
    });
  }

  if (parsed.workflow === "piiImpactReport") {
    requireTools(capabilities, [
      "search_metadata",
      "get_entity_details",
      "get_entity_lineage",
    ]);

    const search = await client.callTool("search_metadata", {
      query: parsed.query,
      entityType: parsed.entityType,
      size: parsed.limit,
    });
    const candidateFqns = extractCandidateFqns(
      search,
      parsed.entityType,
      parsed.fallbackFqn,
    );
    const selectedFqns = candidateFqns.slice(0, parsed.maxEntities);
    const reports = await Promise.all(
      selectedFqns.map(async (fqn) => {
        const [details, lineage] = await Promise.all([
          client.callTool("get_entity_details", {
            entityType: parsed.entityType,
            fqn,
          }),
          client.callTool("get_entity_lineage", {
            entityType: parsed.entityType,
            fqn,
            upstreamDepth: parsed.upstreamDepth,
            downstreamDepth: parsed.downstreamDepth,
          }),
        ]);

        return {
          fqn,
          details,
          lineage,
          detailsText: collectToolText(details),
          lineageText: collectToolText(lineage),
        };
      }),
    );

    return {
      workflow: "piiImpactReport",
      summary: buildPiiImpactSummary({
        query: parsed.query,
        entityType: parsed.entityType,
        candidateFqns,
        reports,
      }),
      candidateFqns,
      search,
      reports,
    };
  }

  requireTools(capabilities, ["get_entity_details", "get_entity_lineage"]);

  const [entity, lineage] = await Promise.all([
    client.callTool("get_entity_details", {
      entityType: parsed.entityType,
      fqn: parsed.fqn,
    }),
    client.callTool("get_entity_lineage", {
      entityType: parsed.entityType,
      fqn: parsed.fqn,
      upstreamDepth: parsed.upstreamDepth,
      downstreamDepth: parsed.downstreamDepth,
    }),
  ]);

  return { entity, lineage };
}
