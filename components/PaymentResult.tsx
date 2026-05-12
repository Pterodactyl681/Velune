"use client";

import { Copy, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { PaymentMode } from "@/components/types";

type PaymentResultProps = {
  link: {
    url: string;
    mode: PaymentMode;
  } | null;
  onCopy: () => void;
};

export function PaymentResult({ link, onCopy }: PaymentResultProps) {
  return (
    <section className="w-full min-w-0 border-t border-line pt-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[19px] font-medium leading-none text-ink">
          Your payment link
        </h2>
        {link ? (
          <StatusBadge label={link.mode === "live" ? "Live" : "Mock"} />
        ) : null}
      </div>

      <div className="mt-4 flex h-[50px] w-full min-w-0 max-w-full items-center overflow-hidden rounded-[10px] border border-line bg-[#fffdfb]">
        <p
          className={`min-w-0 flex-1 truncate px-4 text-[14px] sm:text-[15px] ${
            link ? "text-ink" : "text-[#8a847b]"
          }`}
        >
          {link?.url || "Generated link will appear here."}
        </p>
        <button
          type="button"
          aria-label="Copy generated payment link"
          className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-[#3e3b36] transition hover:bg-[#f4f1ec] focus:outline-none focus:ring-2 focus:ring-line"
          onClick={onCopy}
          disabled={!link}
        >
          <Copy className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      <div className="mt-5 grid w-full min-w-0 gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-3 rounded-[10px] border border-line bg-white px-4 text-[14px] font-medium text-[#3e3b36] transition hover:bg-[#fbfaf7] focus:outline-none focus:ring-2 focus:ring-line focus:ring-offset-2 focus:ring-offset-white"
          onClick={onCopy}
          disabled={!link}
        >
          <Copy className="h-4 w-4" strokeWidth={1.8} />
          Copy link
        </button>
        <a
          href={link?.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!link}
          tabIndex={link ? undefined : -1}
          className={`inline-flex h-11 items-center justify-center gap-3 rounded-[10px] border border-line bg-white px-4 text-[14px] font-medium transition focus:outline-none focus:ring-2 focus:ring-line focus:ring-offset-2 focus:ring-offset-white ${
            link
              ? "text-[#3e3b36] hover:bg-[#fbfaf7]"
              : "pointer-events-none text-[#aaa49b] opacity-70"
          }`}
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
          Open checkout
        </a>
      </div>
    </section>
  );
}
