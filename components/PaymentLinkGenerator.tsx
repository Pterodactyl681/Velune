"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandHeader } from "@/components/BrandHeader";
import { PaymentForm } from "@/components/PaymentForm";
import { PaymentResult } from "@/components/PaymentResult";
import { RecentLinks } from "@/components/RecentLinks";
import { StatusBadge } from "@/components/StatusBadge";
import type {
  CreateLinkResponse,
  PaymentFormValues,
  PaymentMode,
  RecentLink,
} from "@/components/types";

const STORAGE_KEY = "velune.recentLinks";

const initialFormValues: PaymentFormValues = {
  description: "",
  amount: "100.00",
  currency: "USDC",
  walletAddress: "",
  redirectUrl: "",
};

const seedLinks: RecentLink[] = [
  {
    id: "seed-website-development",
    description: "Website development",
    amount: "250.00",
    currency: "USDC",
    status: "Live",
    url: "https://pay.velune.app/checkout/website-development",
    createdAt: 3,
  },
  {
    id: "seed-branding-consultation",
    description: "Branding consultation",
    amount: "150.00",
    currency: "USDC",
    status: "Mock",
    url: "https://pay.velune.app/checkout/branding-consultation",
    createdAt: 2,
  },
  {
    id: "seed-ui-ux-design",
    description: "UI/UX design",
    amount: "300.00",
    currency: "USDC",
    status: "Live",
    url: "https://pay.velune.app/checkout/ui-ux-design",
    createdAt: 1,
  },
];

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
  const [generatedUrl, setGeneratedUrl] = useState(
    "https://pay.velune.app/checkout/3f9a7b1c-8e2d-4a11-9f7c-2b0d9e6f8a1c",
  );
  const [generatedMode, setGeneratedMode] = useState<PaymentMode>("mock");
  const [recentLinks, setRecentLinks] = useState<RecentLink[]>(seedLinks);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as RecentLink[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setRecentLinks(parsed.slice(0, 5));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recentLinks));
  }, [recentLinks]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const canGenerate = useMemo(() => {
    return (
      values.description.trim().length > 0 &&
      values.amount.trim().length > 0 &&
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

      setFeedback("Link copied");
    } catch {
      try {
        fallbackCopy(url);
        setFeedback("Link copied");
      } catch {
        setFeedback("Copy failed");
      }
    }
  }

  function openUrl(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function tryExample() {
    const origin = window.location.origin;

    setValues({
      description: "AI research task",
      amount: "12.00",
      currency: "USDC",
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      redirectUrl: `${origin}/success`,
    });
    setFeedback("Example filled");
  }

  async function generateLink() {
    if (!canGenerate) {
      setFeedback("Add description, amount, and wallet");
      return;
    }

    const price = parseAmount(values.amount);
    if (!Number.isFinite(price) || price <= 0) {
      setFeedback("Amount must be a positive number");
      return;
    }

    setIsGenerating(true);
    setFeedback("");

    try {
      const redirectUrl =
        values.redirectUrl.trim() || `${window.location.origin}/success`;

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

      const payload = (await response.json()) as CreateLinkResponse;

      if (!payload.ok) {
        setFeedback(payload.error);
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

      setGeneratedUrl(payload.url);
      setGeneratedMode(payload.mode);
      setValues((current) => ({
        ...current,
        amount,
        redirectUrl: payload.request.redirectUrl,
      }));
      setRecentLinks((current) => [link, ...current].slice(0, 5));
      setFeedback(
        payload.mode === "live" ? "Live payment link ready" : "Mock link ready",
      );
    } catch {
      setFeedback("Could not create the payment link");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-page px-5 py-7 text-ink sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-[960px]">
        <BrandHeader />

        <section className="mt-7 w-full min-w-0 max-w-full overflow-hidden rounded-[20px] border border-line bg-white px-5 py-6 shadow-card sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="mb-6 flex min-h-7 items-center justify-end">
            <StatusBadge label="Live" dot />
          </div>

          <div className="grid w-full min-w-0 gap-8">
            <PaymentForm
              values={values}
              isGenerating={isGenerating}
              onChange={updateValue}
              onSubmit={generateLink}
              onTryExample={tryExample}
            />

            <PaymentResult
              url={generatedUrl}
              mode={generatedMode}
              onCopy={() => copyUrl(generatedUrl)}
              onOpen={() => openUrl(generatedUrl)}
            />

            <RecentLinks
              links={recentLinks}
              onCopy={copyUrl}
              onOpen={openUrl}
            />
          </div>
        </section>

        <div
          aria-live="polite"
          className="mx-auto mt-4 min-h-6 text-center text-[14px] text-[#5f5f5f]"
        >
          {feedback}
        </div>

        <footer className="pb-7 pt-2 text-center text-[12px] text-[#9a948b]">
          Built for Build with KIRAPAY on Superteam Earn
        </footer>
      </div>
    </main>
  );
}
