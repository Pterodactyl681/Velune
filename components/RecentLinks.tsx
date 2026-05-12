"use client";

import { Copy, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { RecentLink } from "@/components/types";

type RecentLinksProps = {
  links: RecentLink[];
  onCopy: (url: string) => void;
  onOpen: (url: string) => void;
};

export function RecentLinks({ links, onCopy, onOpen }: RecentLinksProps) {
  return (
    <section className="w-full min-w-0">
      <h2 className="text-[14px] font-medium leading-none text-ink">
        Recent links
      </h2>

      <div className="mt-4 w-full min-w-0 overflow-hidden rounded-[12px] border border-line bg-white">
        {links.map((link) => (
          <div
            key={link.id}
            className="w-full min-w-0 border-b border-line px-4 py-3 last:border-b-0 md:grid md:min-h-[54px] md:grid-cols-[minmax(0,1fr)_86px_72px_78px_56px_56px] md:items-center md:gap-x-3"
          >
            <div className="flex min-w-0 items-start justify-between gap-4 md:contents">
              <p className="min-w-0 truncate text-[14px] text-[#343434]">
                {link.description}
              </p>
              <div className="shrink-0 text-right md:contents">
                <p className="text-[14px] text-[#404040] md:justify-self-start md:text-left">
                  {link.amount}
                </p>
                <p className="mt-0.5 text-[12px] text-[#8b8b8b] md:mt-0 md:text-[14px]">
                  {link.currency}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 md:contents">
              <StatusBadge label={link.status} />
              <div className="flex items-center gap-2 md:contents">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-[7px] px-2 py-1 text-[13px] font-medium text-[#4c4943] transition hover:bg-[#f4f1ec] md:justify-self-start"
                  onClick={() => onCopy(link.url)}
                >
                  <Copy className="h-3.5 w-3.5 md:hidden" strokeWidth={1.8} />
                  Copy
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-[7px] px-2 py-1 text-[13px] font-medium text-[#4c4943] transition hover:bg-[#f4f1ec] md:justify-self-start"
                  onClick={() => onOpen(link.url)}
                >
                  <ExternalLink
                    className="h-3.5 w-3.5 md:hidden"
                    strokeWidth={1.8}
                  />
                  Open
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
