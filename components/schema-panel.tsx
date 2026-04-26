type SchemaPanelProps = {
  title: string;
  schema: unknown;
};

export function SchemaPanel({ title, schema }: SchemaPanelProps) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
      <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
      <p className="mt-1 text-sm text-amber-800">
        Live schema returned by the target OpenMetadata MCP instance.
      </p>
      <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-50">
        {schema ? JSON.stringify(schema, null, 2) : "No schema exposed."}
      </pre>
    </section>
  );
}
