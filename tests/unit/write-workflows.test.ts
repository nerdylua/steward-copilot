import { describe, expect, it, vi } from "vitest";

import { buildCapabilityMap } from "@/lib/openmetadata/capabilities";
import { runWriteWorkflow } from "@/lib/openmetadata/workflows/write";

describe("runWriteWorkflow", () => {
  it("creates a glossary with the documented mutuallyExclusive flag", async () => {
    const client = {
      callTool: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "created glossary" }],
      }),
    };
    const capabilities = buildCapabilityMap([
      {
        name: "create_glossary",
        description: "Create glossary",
      },
    ]);

    await runWriteWorkflow(client as never, capabilities, {
      workflow: "createGlossary",
      name: "Stewardship Terms",
      description: "Business terms curated for governed metadata workflows.",
      mutuallyExclusive: false,
    });

    expect(client.callTool).toHaveBeenCalledWith("create_glossary", {
      name: "Stewardship Terms",
      description: "Business terms curated for governed metadata workflows.",
      mutuallyExclusive: false,
    });
  });

  it("creates a glossary term when the tool is available", async () => {
    const client = {
      callTool: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "created glossary term" }],
      }),
    };

    const capabilities = buildCapabilityMap([
      {
        name: "create_glossary_term",
        description: "Create glossary term",
        inputSchema: { type: "object" },
      },
    ]);

    const result = await runWriteWorkflow(client as never, capabilities, {
      workflow: "createGlossaryTerm",
      glossary: "marketing-terms",
      name: "Customer Acquisition Cost",
      description: "Total acquisition spend divided by acquired customers.",
    });

    expect(client.callTool).toHaveBeenCalledWith("create_glossary_term", {
      glossary: "marketing-terms",
      name: "Customer Acquisition Cost",
      description: "Total acquisition spend divided by acquired customers.",
      parentTerm: undefined,
    });
    expect((result as { content: Array<{ text: string }> }).content[0].text).toContain(
      "created",
    );
  });

  it("returns tool availability and schema without calling MCP", async () => {
    const client = {
      callTool: vi.fn(),
    };
    const capabilities = buildCapabilityMap([
      {
        name: "create_test_case",
        description: "Create test case",
        inputSchema: { type: "object", required: ["name"] },
      },
    ]);

    const result = await runWriteWorkflow(client as never, capabilities, {
      workflow: "inspectToolSchema",
      toolName: "create_test_case",
    });

    expect(result).toEqual({
      available: true,
      toolName: "create_test_case",
      schema: { type: "object", required: ["name"] },
    });
    expect(client.callTool).not.toHaveBeenCalled();
  });

  it("does not create a glossary term when the tool is unavailable", async () => {
    const client = {
      callTool: vi.fn(),
    };

    await expect(
      runWriteWorkflow(client as never, buildCapabilityMap([]), {
        workflow: "createGlossaryTerm",
        glossary: "marketing-terms",
        name: "Customer Acquisition Cost",
        description: "Total acquisition spend divided by acquired customers.",
      }),
    ).rejects.toThrow("create_glossary_term");
    expect(client.callTool).not.toHaveBeenCalled();
  });
});
