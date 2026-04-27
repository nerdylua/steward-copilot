import { ClipboardCheck, Database, GitBranch, Search, ShieldCheck, Sparkles } from "lucide-react";

const playbooks = [
  {
    title: "PII discovery workflow",
    subtitle: "Find candidate tables, inspect metadata context, and prepare steward review.",
    accent: "#22C55E",
    nodes: [
      { label: "Search metadata", detail: "customer pii", x: 7, y: 42, icon: Search },
      { label: "Inspect entity", detail: "table details", x: 37, y: 22, icon: Database },
      { label: "Classify risk", detail: "sensitive fields", x: 66, y: 42, icon: ShieldCheck },
    ],
    edges: [
      { d: "M122 165 C190 130 235 110 308 111" },
      { d: "M448 112 C514 116 552 138 618 165" },
    ],
  },
  {
    title: "Lineage impact review",
    subtitle: "Trace upstream and downstream dependencies before operational changes land.",
    accent: "#60A5FA",
    nodes: [
      { label: "Load asset", detail: "table FQN", x: 8, y: 28, icon: Database },
      { label: "Fetch lineage", detail: "2 hops", x: 36, y: 46, icon: GitBranch },
      { label: "Review impact", detail: "owners + consumers", x: 67, y: 25, icon: ShieldCheck },
    ],
    edges: [
      { d: "M126 120 C190 139 234 162 305 171" },
      { d: "M445 171 C510 158 553 129 620 116" },
    ],
  },
  {
    title: "Schema-aware extensions",
    subtitle: "Validate tool contracts before enabling governed metadata operations.",
    accent: "#F04D26",
    nodes: [
      { label: "Check schema", detail: "tool contract", x: 7, y: 43, icon: Sparkles },
      { label: "Review fields", detail: "required inputs", x: 36, y: 21, icon: ClipboardCheck },
      { label: "Enable action", detail: "capability gate", x: 67, y: 43, icon: ShieldCheck },
    ],
    edges: [
      { d: "M122 166 C186 132 232 109 306 110" },
      { d: "M448 111 C516 116 552 140 618 166" },
    ],
  },
];

function SectionConnector({ flip = false }: { flip?: boolean }) {
  return (
    <div className="hidden justify-center bg-[#151515] md:flex">
      <svg width="709" height="60" viewBox="0 0 709 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d={
            flip
              ? "M705.5 6v8c0 8.837-7.163 16-16 16h-318c-8.837 0-16 7.163-16 16v8m0-30V8M5.5 6v8c0 8.837 7.163 16 16 16h318c8.837 0 16 7.163 16 16v8"
              : "M3 54v-8c0-8.837 7.163-16 16-16h318c8.837 0 16-7.163 16-16V6m0 30v16m350 2v-8c0-8.837-7.163-16-16-16H369c-8.837 0-16-7.163-16-16V6"
          }
          stroke="#666"
        />
        <rect x="350" y={flip ? "52" : "0"} width="6" height="6" rx="1" fill="#f04d26" />
        <rect x="350" y={flip ? "0" : "52"} width="6" height="6" rx="1" fill="#f04d26" />
        <rect x="0" y={flip ? "0" : "54"} width="6" height="6" rx="1" fill="#f04d26" />
        <rect x="700" y={flip ? "0" : "54"} width="6" height="6" rx="1" fill="#f04d26" />
      </svg>
    </div>
  );
}

function PlaybookCanvas({ playbook }: { playbook: (typeof playbooks)[number] }) {
  return (
    <div className="pointer-events-none relative h-[330px] overflow-hidden rounded-[24px] border border-white/10 bg-[#111111] p-4 shadow-[0_22px_44px_-28px_rgba(0,0,0,0.9)] select-none">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 740 330" aria-hidden="true">
        {playbook.edges.map((edge) => (
          <path
            key={edge.d}
            d={edge.d}
            fill="none"
            stroke={playbook.accent}
            strokeDasharray="7 7"
            strokeLinecap="round"
            strokeOpacity="0.85"
            strokeWidth="2"
          />
        ))}
      </svg>

      {playbook.nodes.map((node) => {
        const Icon = node.icon;
        return (
          <div
            key={node.label}
            className="absolute w-[176px] rounded-2xl border border-white/10 bg-[#1E1E1E]/95 p-3 shadow-[0_18px_36px_-24px_rgba(0,0,0,0.95)]"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className="flex size-8 items-center justify-center rounded-[10px] border border-white/10"
                style={{ backgroundColor: `${playbook.accent}22`, color: playbook.accent }}
              >
                <Icon className="size-4" />
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/35">Node</span>
            </div>
            <div className="text-sm font-medium text-white">{node.label}</div>
            <div className="mt-1 text-xs text-white/45">{node.detail}</div>
          </div>
        );
      })}

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111111] to-transparent" />
    </div>
  );
}

export function TemplatesSection() {
  return (
    <>
      <SectionConnector />
      <section id="templates" className="relative min-h-screen snap-start overflow-hidden bg-[#151515] py-16 md:py-20 xl:py-24">
        <div className="relative z-10 mx-auto w-[92%] md:w-[88%] lg:w-[90%]">
          <div className="flex flex-col items-center">
            <div className="flex h-8 items-center gap-2 rounded-[11px] border border-[#F04D26] bg-[#F04D26]/5 px-2.5 text-xs font-medium text-white/75 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.6)]">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6.8C4 5.2536 5.2536 4 6.8 4H17.2C18.7464 4 20 5.2536 20 6.8V17.2C20 18.7464 18.7464 20 17.2 20H6.8C5.2536 20 4 18.7464 4 17.2V6.8Z" stroke="currentColor" strokeWidth="2" />
                <path d="M8 9H16M8 12H13M8 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
              </svg>
              <span>Metadata Playbooks</span>
            </div>
            <h2 className="mt-4 text-center text-pretty font-serif text-xl leading-tight text-[#7D7D87] italic md:text-2xl xl:whitespace-nowrap">
              Static previews of production paths for governed metadata work
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-3">
            {playbooks.map((playbook) => (
              <article key={playbook.title} className="rounded-[30px] bg-[#1A1A1A] p-[5px]">
                <div className="rounded-[27px] border border-white/10 p-[2px]">
                  <div className="overflow-hidden rounded-[24px] border border-white/5">
                    <PlaybookCanvas playbook={playbook} />
                  </div>
                </div>
                <div className="px-4 pb-5 pt-4">
                  <h3 className="text-lg font-medium text-white">{playbook.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#7D7D87]">{playbook.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <SectionConnector flip />
    </>
  );
}