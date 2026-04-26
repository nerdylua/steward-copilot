"use client";

import { useState } from "react";

import { ResultPanel } from "@/components/result-panel";
import { SchemaPanel } from "@/components/schema-panel";

type WorkflowEndpoint = "/api/workflows/read" | "/api/workflows/write";

type WorkflowPreset = {
  name: string;
  eyebrow: string;
  endpoint: WorkflowEndpoint;
  payload: Record<string, unknown>;
  description: string;
};

const workflowPresets: WorkflowPreset[] = [
  {
    name: "Search customer PII",
    eyebrow: "Step 1",
    endpoint: "/api/workflows/read",
    description: "Find candidate tables through the documented search_metadata tool.",
    payload: {
      workflow: "search",
      query: "customer pii",
      entityType: "table",
      limit: 5,
    },
  },
  {
    name: "Inspect impact",
    eyebrow: "Step 2",
    endpoint: "/api/workflows/read",
    description:
      "Fetch entity details and lineage together for impact analysis before a governance change.",
    payload: {
      workflow: "impact",
      entityType: "table",
      fqn: "sample_data.ecommerce_db.shopify.raw_customer",
      upstreamDepth: 2,
      downstreamDepth: 2,
    },
  },
  {
    name: "Create glossary",
    eyebrow: "Step 3",
    endpoint: "/api/workflows/write",
    description:
      "Create a governed business glossary when the instance exposes create_glossary.",
    payload: {
      workflow: "createGlossary",
      name: "Hackathon Stewardship",
      description: "Business terms curated during the steward copilot demo.",
      mutuallyExclusive: false,
    },
  },
  {
    name: "Create glossary term",
    eyebrow: "Step 4",
    endpoint: "/api/workflows/write",
    description:
      "Create a safe glossary term through the documented create_glossary_term tool.",
    payload: {
      workflow: "createGlossaryTerm",
      glossary: "Hackathon Stewardship",
      name: "Customer Acquisition Cost",
      description: "Total acquisition spend divided by acquired customers.",
    },
  },
  {
    name: "Inspect extension schema",
    eyebrow: "Bonus",
    endpoint: "/api/workflows/write",
    description:
      "Show judges how future governed actions are enabled only after tool-schema discovery.",
    payload: {
      workflow: "inspectToolSchema",
      toolName: "create_test_case",
    },
  },
];

const initialPreset = workflowPresets[0];

function stringifyPayload(payload: Record<string, unknown>) {
  return JSON.stringify(payload, null, 2);
}

function extractSchema(response: unknown) {
  if (
    typeof response !== "object" ||
    response === null ||
    !("result" in response)
  ) {
    return null;
  }

  const result = (response as { result?: unknown }).result;
  if (
    typeof result === "object" &&
    result !== null &&
    "toolName" in result &&
    "schema" in result
  ) {
    return {
      title: `Schema for ${(result as { toolName: string }).toolName}`,
      schema: (result as { schema: unknown }).schema,
    };
  }

  return null;
}

export function WorkflowShell() {
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [payload, setPayload] = useState(() =>
    stringifyPayload(initialPreset.payload),
  );
  const [result, setResult] = useState<unknown>({
    ok: true,
    message: "Choose a workflow preset, adjust the JSON if needed, then run it.",
  });
  const [isRunning, setIsRunning] = useState(false);

  function choosePreset(preset: WorkflowPreset) {
    setSelectedPreset(preset);
    setPayload(stringifyPayload(preset.payload));
  }

  async function runWorkflow() {
    setIsRunning(true);

    try {
      JSON.parse(payload);
    } catch {
      setResult({
        ok: false,
        code: "invalid_json",
        error: "The payload editor must contain valid JSON before running.",
      });
      setIsRunning(false);
      return;
    }

    try {
      const response = await fetch(selectedPreset.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      const contentType = response.headers.get("content-type") ?? "";
      const responseBody = contentType.includes("application/json")
        ? await response.json()
        : { ok: false, error: await response.text() };

      setResult(responseBody);
    } catch (error) {
      setResult({
        ok: false,
        code: "request_failed",
        error:
          error instanceof Error
            ? error.message
            : "The workflow request failed before reaching the server.",
      });
    } finally {
      setIsRunning(false);
    }
  }

  const inspectedSchema = extractSchema(result);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#d1fae5,_transparent_32rem),linear-gradient(180deg,_#f8fafc,_#eef2ff)] px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl border border-white/70 bg-white/85 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            OpenMetadata MCP prototype
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
                Steward Copilot for governed metadata workflows.
              </h1>
              <p className="mt-5 max-w-3xl text-lg text-slate-600">
                Search metadata, inspect lineage, and create glossary assets
                through documented OpenMetadata MCP tools with live capability
                checks before every action.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h2 className="font-semibold text-emerald-950">Demo Story</h2>
              <ol className="mt-3 space-y-2 text-sm text-emerald-900">
                <li>1. Search for customer PII tables.</li>
                <li>2. Inspect lineage before changing governance.</li>
                <li>3. Create glossary assets safely.</li>
                <li>4. Show schema-probed future actions.</li>
              </ol>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-900/5">
            <h2 className="text-lg font-semibold">Guided Workflow Presets</h2>
            <p className="mt-1 text-sm text-slate-600">
              Pick a judged demo moment. The JSON remains editable for live
              sandbox differences.
            </p>
            <div className="mt-5 space-y-3">
              {workflowPresets.map((preset) => {
                const isSelected = preset.name === selectedPreset.name;

                return (
                  <button
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-emerald-300"
                    }`}
                    key={preset.name}
                    onClick={() => choosePreset(preset)}
                    type="button"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      {preset.eyebrow}
                    </span>
                    <span className="mt-1 block font-semibold">
                      {preset.name}
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">
                      {preset.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-900/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {selectedPreset.endpoint}
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {selectedPreset.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedPreset.description}
                </p>
              </div>
              <button
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isRunning}
                onClick={runWorkflow}
                type="button"
              >
                {isRunning ? "Running..." : "Run workflow"}
              </button>
            </div>

            <label
              className="mt-5 block text-sm font-medium text-slate-700"
              htmlFor="workflow-payload"
            >
              Editable workflow payload
            </label>
            <textarea
              className="mt-2 min-h-80 w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm leading-relaxed text-slate-50 shadow-inner outline-none ring-emerald-400 transition focus:ring-2"
              id="workflow-payload"
              onChange={(event) => setPayload(event.target.value)}
              spellCheck={false}
              value={payload}
            />
          </section>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <ResultPanel result={result} />
          {inspectedSchema ? (
            <SchemaPanel
              schema={inspectedSchema.schema}
              title={inspectedSchema.title}
            />
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 text-slate-700">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Capability Guardrail
              </h2>
              <p className="mt-2 text-sm">
                The server probes `tools/list`, caches tool schemas, and blocks
                workflows when the target instance does not expose the required
                MCP tool.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
