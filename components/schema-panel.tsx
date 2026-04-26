type SchemaPanelProps = {
  title: string;
  schema: unknown;
};

export function SchemaPanel({ title, schema }: SchemaPanelProps) {
  return (
    <section className="rounded-[22px] border border-[#F04D26]/20 bg-white/85 p-4 text-slate-900 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
      <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">
        Live schema returned by the target OpenMetadata MCP instance.
      </p>
      <pre className="mt-3 max-h-72 overflow-auto rounded-[16px] bg-[#151515] p-3 text-xs text-zinc-50">
        {schema ? JSON.stringify(schema, null, 2) : "No schema exposed."}
      </pre>
    </section>
  );
}
