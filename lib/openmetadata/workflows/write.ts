import { z } from "zod";

import { requireTools } from "@/lib/openmetadata/capabilities";
import type { OpenMetadataToolName, ToolCapabilityMap } from "@/types/openmetadata";

const inspectableTools = [
  "search_metadata",
  "get_entity_details",
  "get_entity_lineage",
  "create_glossary",
  "create_glossary_term",
  "semantic_search",
  "patch_entity",
  "create_test_case",
  "root_cause_analysis",
] as const satisfies readonly OpenMetadataToolName[];

export const writeWorkflowSchema = z.union([
  z.object({
    workflow: z.literal("createGlossary"),
    name: z.string().min(1),
    description: z.string().min(10),
    mutuallyExclusive: z.boolean().default(false),
  }),
  z.object({
    workflow: z.literal("createGlossaryTerm"),
    glossary: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(10),
    parentTerm: z.string().optional(),
  }),
  z.object({
    workflow: z.literal("inspectToolSchema"),
    toolName: z.enum(inspectableTools),
  }),
]);

export async function runWriteWorkflow(
  client: {
    callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  },
  capabilities: ToolCapabilityMap,
  input: z.input<typeof writeWorkflowSchema>,
) {
  const parsed = writeWorkflowSchema.parse(input);

  if (parsed.workflow === "inspectToolSchema") {
    return {
      available: capabilities[parsed.toolName],
      toolName: parsed.toolName,
      schema: capabilities.schemas[parsed.toolName] ?? null,
    };
  }

  if (parsed.workflow === "createGlossary") {
    requireTools(capabilities, ["create_glossary"]);

    return client.callTool("create_glossary", {
      name: parsed.name,
      description: parsed.description,
      mutuallyExclusive: parsed.mutuallyExclusive,
    });
  }

  requireTools(capabilities, ["create_glossary_term"]);

  return client.callTool("create_glossary_term", {
    glossary: parsed.glossary,
    name: parsed.name,
    description: parsed.description,
    parentTerm: parsed.parentTerm,
  });
}
