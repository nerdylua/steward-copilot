import type {
  MCPToolCallResult,
  MCPToolDefinition,
} from "@/types/openmetadata";

type MCPClientConfig = {
  host: string;
  token: string;
  fetchFn?: typeof fetch;
};

export function createMcpClient({
  host,
  token,
  fetchFn = fetch,
}: MCPClientConfig) {
  let initialized = false;
  const endpoint = `${host.replace(/\/+$/, "")}/mcp`;

  async function request<T>(
    method: string,
    params?: Record<string, unknown>,
  ): Promise<T> {
    const response = await fetchFn(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        ...(params ? { params } : {}),
      }),
      cache: "no-store",
    });

    const rawBody = await response.text();

    if (!response.ok) {
      throw new Error(
        `OpenMetadata MCP request failed with HTTP ${response.status}: ${rawBody}`,
      );
    }

    const payload = JSON.parse(rawBody) as {
      result?: T;
      error?: { message: string };
    };

    if (payload.error) {
      throw new Error(payload.error.message);
    }

    if (payload.result === undefined) {
      throw new Error("OpenMetadata MCP response did not include a result");
    }

    return payload.result as T;
  }

  function assertToolResult(result: MCPToolCallResult) {
    if (!result.isError) {
      return result;
    }

    const message =
      result.content
        .map((item) => item.text)
        .filter(Boolean)
        .join("\n") || "OpenMetadata MCP tool call failed";

    throw new Error(message);
  }

  async function initialize() {
    if (initialized) {
      return;
    }

    await request("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {},
        prompts: {},
        resources: { subscribe: true, listChanged: true },
      },
      clientInfo: {
        name: "openmetadata-steward-copilot",
        version: "0.1.0",
      },
    });

    initialized = true;
  }

  return {
    async listTools(): Promise<MCPToolDefinition[]> {
      await initialize();
      const result = await request<{ tools: MCPToolDefinition[] }>("tools/list");
      return result.tools;
    },
    async callTool(
      name: string,
      args: Record<string, unknown>,
    ): Promise<MCPToolCallResult> {
      await initialize();
      const result = await request<MCPToolCallResult>("tools/call", {
        name,
        arguments: args,
      });
      return assertToolResult(result);
    },
  };
}
