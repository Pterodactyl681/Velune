"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandHeader } from "@/components/BrandHeader";
import { PaymentForm } from "@/components/PaymentForm";
import { PaymentResult } from "@/components/PaymentResult";
import { RecentLinks } from "@/components/RecentLinks";
import type {
  CreateLinkResponse,
  PaymentFormValues,
  PaymentMode,
  RecentLink,
} from "@/components/types";

const STORAGE_KEY = "velune_recent_links_v2";
const EXAMPLE_RECEIVER = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

const initialFormValues: PaymentFormValues = {
  description: "",
  amount: "12.00",
  currency: "USDC",
  walletAddress: "",
  redirectUrl: "",
};

type GeneratedLink = {
  url: string;
  mode: PaymentMode;
};

type Feedback = {
  tone: "success" | "error";
  text: string;
};

function createLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 12);
}

function parseAmount(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function statusFromMode(mode: PaymentMode) {
  return mode === "live" ? "Live" : "Mock";
}

export function PaymentLinkGenerator() {
  const [values, setValues] = useState<PaymentFormValues>(initialFormValues);
  const [generatedLink, setGeneratedLink] = useState<GeneratedLink | null>(
    null,
  );
  const [recentLinks, setRecentLinks] = useState<RecentLink[]>([]);
  const [hasLoadedRecentLinks, setHasLoadedRecentLinks] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    setValues((current) => ({
      ...current,
      redirectUrl: current.redirectUrl || `${window.location.origin}/success`,
    }));
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setHasLoadedRecentLinks(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as RecentLink[];
      if (Array.isArray(parsed)) {
        setRecentLinks(parsed.slice(0, 5));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHasLoadedRecentLinks(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedRecentLinks) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recentLinks));
  }, [hasLoadedRecentLinks, recentLinks]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const canGenerate = useMemo(() => {
    return (
      values.description.trim().length > 0 &&
      values.amount.trim().length > 0 &&
      values.redirectUrl.trim().length > 0 &&
      values.walletAddress.trim().length > 0
    );
  }, [values]);

  function updateValue(field: keyof PaymentFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function fallbackCopy(url: string) {
    const textarea = document.createElement("textarea");
    textarea.value = url;
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

  async function copyUrl(url: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await Promise.race([
          navigator.clipboard.writeText(url),
          new Promise((_, reject) => {
            window.setTimeout(() => reject(new Error("Clipboard timeout")), 500);
          }),
        ]);
      } else {
        fallbackCopy(url);
      }

      setFeedback({ tone: "success", text: "Copied" });
    } catch {
      try {
        fallbackCopy(url);
        setFeedback({ tone: "success", text: "Copied" });
      } catch {
        setFeedback({ tone: "error", text: "Copy failed" });
      }
    }
  }

  function tryExample() {
    const origin = window.location.origin;

    setValues({
      description: "AI research task",
      amount: "12.00",
      currency: "USDC",
      walletAddress: EXAMPLE_RECEIVER,
      redirectUrl: `${origin}/success`,
    });
    setFeedback({ tone: "success", text: "Example filled" });
  }

  function clearHistory() {
    setRecentLinks([]);
    setFeedback({ tone: "success", text: "History cleared" });
  }

  async function generateLink() {
    if (!canGenerate) {
      setFeedback({
        tone: "error",
        text: "Add description, amount, wallet, and redirect URL",
      });
      return;
    }

    const price = parseAmount(values.amount);
    if (!Number.isFinite(price) || price <= 0) {
      setFeedback({ tone: "error", text: "Amount must be a positive number" });
      return;
    }

    setIsGenerating(true);
    setFeedback(null);

    try {
      const redirectUrl = values.redirectUrl.trim();

      const response = await fetch("/api/kirapay/create-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.description.trim(),
          price,
          currency: values.currency,
          receiver: values.walletAddress.trim(),
          redirectUrl,
        }),
      });

      const payload = (await response.json().catch(() => ({
        ok: false,
        error: "Payment link service returned an invalid response",
      }))) as CreateLinkResponse;

      if (!payload.ok) {
        setFeedback({ tone: "error", text: payload.error });
        return;
      }

      const amount = payload.request.price.toFixed(2);
      const link: RecentLink = {
        id: createLocalId(),
        description: payload.request.name,
        amount,
        currency: payload.request.currency,
        status: statusFromMode(payload.mode),
        url: payload.url,
        createdAt: Date.now(),
      };

      setGeneratedLink({ url: payload.url, mode: payload.mode });
      setValues((current) => ({
        ...current,
        amount,
        redirectUrl: payload.request.redirectUrl,
      }));
      setRecentLinks((current) =>
        [link, ...current.filter((item) => item.url !== link.url)].slice(0, 5),
      );
      setFeedback(
        payload.mode === "live"
          ? { tone: "success", text: "Live payment link ready" }
          : { tone: "success", text: "Mock link ready" },
      );
    } catch {
      setFeedback({
        tone: "error",
        text: "Could not create the payment link",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-page px-5 py-7 text-ink sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-[960px]">
        <BrandHeader />

        <section className="mt-7 w-full min-w-0 max-w-full overflow-hidden rounded-[20px] border border-line bg-white px-5 py-6 shadow-card sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="grid w-full min-w-0 gap-8">
            <PaymentForm
              values={values}
              isGenerating={isGenerating}
              onChange={updateValue}
              onSubmit={generateLink}
              onTryExample={tryExample}
            />

            <PaymentResult
              link={generatedLink}
              onCopy={() => {
                if (generatedLink) {
                  copyUrl(generatedLink.url);
                }
              }}
            />

            <RecentLinks
              links={recentLinks}
              onCopy={copyUrl}
              onClear={clearHistory}
            />
          </div>
        </section>

        <div
          aria-live="polite"
          className={`mx-auto mt-4 min-h-6 text-center text-[14px] ${
            feedback?.tone === "error" ? "text-[#a34531]" : "text-[#5f5f5f]"
          }`}
        >
          {feedback?.text}
        </div>

        <footer className="pb-7 pt-2 text-center text-[12px] text-[#9a948b]">
          Built for Build with KIRAPAY on Superteam Earn
        </footer>
      </div>
    </main>
  );
}
