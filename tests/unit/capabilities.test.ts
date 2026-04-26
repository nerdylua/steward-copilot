import { describe, expect, it, vi } from "vitest";

import {
  buildCapabilityMap,
  getCachedCapabilities,
} from "@/lib/openmetadata/capabilities";

describe("buildCapabilityMap", () => {
  it("maps known tools and preserves input schemas", () => {
    const capabilities = buildCapabilityMap([
      {
        name: "search_metadata",
        description: "Search metadata",
        inputSchema: { type: "object" },
      },
    ]);

    expect(capabilities.search_metadata).toBe(true);
    expect(capabilities.get_entity_lineage).toBe(false);
    expect(capabilities.schemas.search_metadata).toEqual({ type: "object" });
  });
});

describe("getCachedCapabilities", () => {
  it("deduplicates tool discovery for the same OpenMetadata host", async () => {
    const client = {
      listTools: vi.fn().mockResolvedValue([
        {
          name: "search_metadata",
          description: "Search metadata",
        },
      ]),
    };

    const [first, second] = await Promise.all([
      getCachedCapabilities("https://metadata.example", client),
      getCachedCapabilities("https://metadata.example", client),
    ]);

    expect(client.listTools).toHaveBeenCalledTimes(1);
    expect(first.search_metadata).toBe(true);
    expect(second.search_metadata).toBe(true);
  });
});
