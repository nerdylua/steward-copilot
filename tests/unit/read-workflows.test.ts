import { describe, expect, it, vi } from "vitest";

import { buildCapabilityMap } from "@/lib/openmetadata/capabilities";
import { runReadWorkflow } from "@/lib/openmetadata/workflows/read";

describe("runReadWorkflow", () => {
  it("returns details and lineage for impact analysis", async () => {
    const capabilities = buildCapabilityMap([
      {
        name: "get_entity_details",
        description: "Get entity details",
      },
      {
        name: "get_entity_lineage",
        description: "Get entity lineage",
      },
    ]);
    const client = {
      callTool: vi
        .fn()
        .mockResolvedValueOnce({ content: [{ type: "text", text: "details" }] })
        .mockResolvedValueOnce({ content: [{ type: "text", text: "lineage" }] }),
    };

    const result = await runReadWorkflow(client as never, capabilities, {
      workflow: "impact",
      entityType: "table",
      fqn: "mysql_prod.ecommerce.public.customer_orders",
      upstreamDepth: 2,
      downstreamDepth: 2,
    });

    expect(client.callTool).toHaveBeenNthCalledWith(1, "get_entity_details", {
      entityType: "table",
      fqn: "mysql_prod.ecommerce.public.customer_orders",
    });
    expect(client.callTool).toHaveBeenNthCalledWith(2, "get_entity_lineage", {
      entityType: "table",
      fqn: "mysql_prod.ecommerce.public.customer_orders",
      upstreamDepth: 2,
      downstreamDepth: 2,
    });
    expect((result as { lineage: { content: Array<{ text: string }> } }).lineage
      .content[0].text).toContain("lineage");
  });

  it("does not call search when search_metadata is unavailable", async () => {
    const client = {
      callTool: vi.fn(),
    };

    await expect(
      runReadWorkflow(client as never, buildCapabilityMap([]), {
        workflow: "search",
        query: "customer",
      }),
    ).rejects.toThrow("search_metadata");
    expect(client.callTool).not.toHaveBeenCalled();
  });

  it("passes live MCP search field names", async () => {
    const client = {
      callTool: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "search results" }],
      }),
    };

    await runReadWorkflow(
      client as never,
      buildCapabilityMap([
        {
          name: "search_metadata",
          description: "Search metadata",
        },
      ]),
      {
        workflow: "search",
        query: "customer pii",
        entityType: "table",
        limit: 3,
      },
    );

    expect(client.callTool).toHaveBeenCalledWith("search_metadata", {
      query: "customer pii",
      entityType: "table",
      size: 3,
    });
  });
});
