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
]);

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
