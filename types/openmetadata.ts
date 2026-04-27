export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
}

export interface MCPToolCallResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

export interface ToolCapabilityMap {
  search_metadata: boolean;
  get_entity_details: boolean;
  get_entity_lineage: boolean;
  create_glossary: boolean;
  create_glossary_term: boolean;
  patch_entity: boolean;
  create_test_case: boolean;
  root_cause_analysis: boolean;
  semantic_search: boolean;
  schemas: Record<string, Record<string, unknown> | null>;
}

export type OpenMetadataToolName = Exclude<keyof ToolCapabilityMap, "schemas">;
