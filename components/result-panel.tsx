import ReactMarkdown from "react-markdown";

type ResultPanelProps = {
  renderMarkdown?: boolean;
  title?: string;
  result: unknown;
};

export function ResultPanel({
  renderMarkdown = false,
  title = "MCP Output",
  result,
}: ResultPanelProps) {
  const isMarkdown = renderMarkdown && typeof result === "string";

  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-950/10 bg-[#151515] shadow-[0_18px_40px_-30px_rgba(15,23,42,0.55)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          {title}
        </h2>
        <span className="rounded-full bg-[#F04D26]/15 px-2.5 py-1 text-xs font-medium text-orange-200">
          {isMarkdown ? "Markdown summary" : "JSON-RPC response"}
        </span>
      </div>
      {isMarkdown ? (
        <div className="max-h-[34rem] min-h-80 overflow-auto p-5 text-sm leading-7 text-slate-100">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="mb-4 text-xl font-semibold text-white">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mb-3 mt-6 text-base font-semibold text-white first:mt-0">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mb-2 mt-4 text-sm font-semibold text-orange-100">
                  {children}
                </h3>
              ),
              li: ({ children }) => (
                <li className="ml-5 list-disc pl-1">{children}</li>
              ),
              p: ({ children }) => (
                <p className="mb-3 text-slate-200">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-white">{children}</strong>
              ),
            }}
          >
            {result}
          </ReactMarkdown>
        </div>
      ) : (
        <pre className="max-h-[34rem] min-h-80 overflow-auto p-4 text-xs leading-relaxed text-slate-50">
          {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
        </pre>
      )}
    </section>
  );
}
