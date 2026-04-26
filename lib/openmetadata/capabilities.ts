import type {
  MCPToolDefinition,
  OpenMetadataToolName,
  ToolCapabilityMap,
} from "@/types/openmetadata";

type CapabilityClient = {
  listTools: () => Promise<MCPToolDefinition[]>;
};

const CAPABILITY_TTL_MS = 5 * 60 * 1000;
const capabilityCache = new Map<
  string,
  { expiresAt: number; value: ToolCapabilityMap; pending?: Promise<ToolCapabilityMap> }
>();

export function buildCapabilityMap(
  tools: MCPToolDefinition[],
): ToolCapabilityMap {
  const names = new Set(tools.map((tool) => tool.name));
  const schemas = Object.fromEntries(
    tools.map((tool) => [tool.name, tool.inputSchema ?? null]),
  );

  return {
    search_metadata: names.has("search_metadata"),
    get_entity_details: names.has("get_entity_details"),
    get_entity_lineage: names.has("get_entity_lineage"),
    create_glossary: names.has("create_glossary"),
    create_glossary_term: names.has("create_glossary_term"),
    patch_entity: names.has("patch_entity"),
    create_test_case: names.has("create_test_case"),
    root_cause_analysis: names.has("root_cause_analysis"),
    semantic_search: names.has("semantic_search"),
    schemas,
  };
}

export async function getCachedCapabilities(
  cacheKey: string,
  client: CapabilityClient,
): Promise<ToolCapabilityMap> {
  const now = Date.now();
  const cached = capabilityCache.get(cacheKey);

  if (cached?.pending) {
    return cached.pending;
  }

  if (cached?.value && cached.expiresAt > now) {
    return cached.value;
  }

  const fallback = cached?.value ?? buildCapabilityMap([]);
  const pending = client
    .listTools()
    .then((tools) => {
      const value = buildCapabilityMap(tools);
      capabilityCache.set(cacheKey, {
        expiresAt: Date.now() + CAPABILITY_TTL_MS,
        value,
      });
      return value;
    })
    .catch((error) => {
      capabilityCache.set(cacheKey, {
        expiresAt: Date.now() + 30_000,
        value: fallback,
      });
      throw error;
    });

  capabilityCache.set(cacheKey, {
    expiresAt: now + CAPABILITY_TTL_MS,
    value: fallback,
    pending,
  });

  return pending;
}

export function requireTools(
  capabilities: ToolCapabilityMap,
  requiredTools: OpenMetadataToolName[],
) {
  const missingTools = requiredTools.filter((tool) => !capabilities[tool]);

  if (missingTools.length > 0) {
    throw new Error(
      `OpenMetadata instance is missing required MCP tool(s): ${missingTools.join(
        ", ",
      )}`,
    );
  }
}
