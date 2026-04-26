type ResultPanelProps = {
  title?: string;
  result: unknown;
};

export function ResultPanel({ title = "MCP Output", result }: ResultPanelProps) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-950/10 bg-[#151515] shadow-[0_18px_40px_-30px_rgba(15,23,42,0.55)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          {title}
        </h2>
        <span className="rounded-full bg-[#F04D26]/15 px-2.5 py-1 text-xs font-medium text-orange-200">
          JSON-RPC response
        </span>
      </div>
      <pre className="max-h-[34rem] min-h-80 overflow-auto p-4 text-xs leading-relaxed text-slate-50">
        {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
      </pre>
    </section>
  );
}
