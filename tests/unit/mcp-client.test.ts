import { describe, expect, it, vi } from "vitest";

import { createMcpClient } from "@/lib/openmetadata/mcp-client";

describe("createMcpClient", () => {
  it("initializes and lists tools from the MCP endpoint", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({ result: { protocolVersion: "2024-11-05" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            result: {
              tools: [
                {
                  name: "search_metadata",
                  description: "Find your data",
                  inputSchema: { type: "object" },
                },
              ],
            },
          }),
      });

    const client = createMcpClient({
      host: "https://sandbox.open-metadata.org/",
      token: "demo-token",
      fetchFn: fetchFn as never,
    });

    const tools = await client.listTools();

    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(fetchFn).toHaveBeenCalledWith(
      "https://sandbox.open-metadata.org/mcp",
      expect.objectContaining({ method: "POST" }),
    );
    expect(tools[0].name).toBe("search_metadata");
  });

  it("throws clear errors for non-OK MCP responses", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    const client = createMcpClient({
      host: "https://sandbox.open-metadata.org",
      token: "bad-token",
      fetchFn: fetchFn as never,
    });

    await expect(client.listTools()).rejects.toThrow(
      "OpenMetadata MCP request failed with HTTP 401",
    );
  });
});
