type ResultPanelProps = {
  title?: string;
  result: unknown;
};

export function ResultPanel({ title = "MCP Output", result }: ResultPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/10">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          {title}
        </h2>
        <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
          JSON-RPC response
        </span>
      </div>
      <pre className="max-h-[34rem] min-h-80 overflow-auto p-4 text-xs leading-relaxed text-slate-50">
        {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
      </pre>
    </section>
  );
}
