"use client";

import { useMemo, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";

import { StatusBadge } from "@/components/StatusBadge";
import type { PaymentMode } from "@/components/types";

type PaymentResultProps = {
  link: {
    url: string;
    mode: PaymentMode;
    amount: string;
    currency: string;
  } | null;
  onCopy: () => void;
};

function fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Copy command failed");
  }
}

export function PaymentResult({ link, onCopy }: PaymentResultProps) {
  const [embedCopied, setEmbedCopied] = useState(false);

  const embedCode = useMemo(() => {
    if (!link) {
      return "";
    }

    return `<a
  href="${link.url}"
  target="_blank"
  rel="noopener noreferrer"
  style="display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:12px;background:#111;color:#fff;text-decoration:none;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;font-weight:600;"
>
  Pay ${link.amount} ${link.currency}
</a>`;
  }, [link]);

  async function copyEmbedCode() {
    if (!embedCode) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(embedCode);
      } else {
        fallbackCopy(embedCode);
      }

      setEmbedCopied(true);
      window.setTimeout(() => setEmbedCopied(false), 1500);
    } catch {
      try {
        fallbackCopy(embedCode);
        setEmbedCopied(true);
        window.setTimeout(() => setEmbedCopied(false), 1500);
      } catch {
        setEmbedCopied(false);
      }
    }
  }

  return (
    <section className="w-full min-w-0 border-t border-line pt-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[19px] font-medium leading-none text-ink">
          Your payment link
        </h2>

        {link ? (
          <StatusBadge label={link.mode === "live" ? "Live" : "Demo"} />
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
          className="inline-flex h-11 items-center justify-center gap-3 rounded-[10px] border border-line bg-white px-4 text-[14px] font-medium text-[#3e3b36] transition hover:bg-[#fbfaf7] focus:outline-none focus:ring-2 focus:ring-line focus:ring-offset-2 focus:ring-offset-white disabled:pointer-events-none disabled:opacity-50"
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

      {link ? (
        <div className="mt-7 rounded-[14px] border border-line bg-[#fffdfb] p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-[15px] font-medium text-ink">
                Embed button
              </h3>
              <p className="mt-1 text-[13px] text-[#7d776e]">
                Copy this button to your website.
              </p>
            </div>

            <button
              type="button"
              onClick={copyEmbedCode}
              className="mt-3 inline-flex h-9 items-center justify-center rounded-[9px] border border-line bg-white px-3 text-[13px] font-medium text-[#3e3b36] transition hover:bg-[#fbfaf7] sm:mt-0"
            >
              {embedCopied ? "Copied" : "Copy embed code"}
            </button>
          </div>

          <pre className="mt-4 max-h-[180px] overflow-auto whitespace-pre-wrap break-all rounded-[10px] border border-line bg-white p-3 text-[12px] leading-relaxed text-[#4f4942]">
            <code>{embedCode}</code>
          </pre>
        </div>
      ) : null}
    </section>
  );
}
    </section>
  );
}
