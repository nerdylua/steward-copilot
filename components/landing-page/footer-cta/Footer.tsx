"use client";

import { OpenMetadataIcon } from "@/components/openmetadata-icon";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Workspace", href: "#playground" },
      { label: "Use cases", href: "#templates" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Workflows",
    links: [
      { label: "Metadata search", href: "/home" },
      { label: "Lineage review", href: "/home" },
      { label: "Glossary changes", href: "/home" },
      { label: "Schema checks", href: "/home" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Open app", href: "/home" },
      { label: "FAQ", href: "#faq" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const LogoSvg = () => (
  <OpenMetadataIcon
    size={34}
    className="block overflow-visible drop-shadow-[0_0_14px_rgba(141,106,240,0.35)]"
  />
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden pt-8 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative z-10 rounded-[28px] border border-white/10 bg-[#111111] p-6 md:p-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <LogoSvg />
                <span className="text-lg font-semibold text-white">Steward Copilot</span>
              </div>
              <p className="max-w-md text-sm leading-6 text-white/60">
                A production-minded workspace for OpenMetadata teams that need guided search, lineage impact review, and governed metadata changes through MCP.
              </p>
              <a
                href="/home"
                className="mt-6 inline-flex h-10 items-center rounded-[12px] bg-[#F04D26] px-4 text-sm font-medium text-white transition hover:bg-[#e04420]"
              >
                Open workspace
              </a>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <h3 className="mb-4 text-sm font-semibold text-white">{column.title}</h3>
                  <ul className="space-y-3">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="text-sm text-white/60 transition hover:text-white">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <p>© {currentYear} Steward Copilot. All rights reserved.</p>
            <p>Built for governed OpenMetadata operations.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}