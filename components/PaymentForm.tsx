"use client";

import { ChevronDown } from "lucide-react";
import type { PaymentFormValues } from "@/components/types";

type PaymentFormProps = {
  values: PaymentFormValues;
  isGenerating: boolean;
  onChange: (field: keyof PaymentFormValues, value: string) => void;
  onSubmit: () => void;
  onTryExample: () => void;
};

const fieldClass =
  "block h-[50px] min-w-0 w-full max-w-full rounded-[10px] border border-line bg-white px-4 text-[15px] text-ink outline-none transition placeholder:text-[#8e8a83] focus:border-[#b9b1a6] focus:ring-4 focus:ring-[#141414]/[0.035]";

export function PaymentForm({
  values,
  isGenerating,
  onChange,
  onSubmit,
  onTryExample,
}: PaymentFormProps) {
  return (
    <form
      className="grid w-full min-w-0 grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="grid w-full min-w-0 gap-2 md:col-span-2">
        <span className="text-[14px] font-medium leading-none text-ink">
          Payment description
        </span>
        <input
          className={fieldClass}
          placeholder="e.g. Design services"
          value={values.description}
          onChange={(event) => onChange("description", event.target.value)}
        />
      </label>

      <label className="grid w-full min-w-0 gap-2 md:col-span-1">
        <span className="text-[14px] font-medium leading-none text-ink">
          Amount
        </span>
        <input
          className={fieldClass}
          inputMode="decimal"
          placeholder="100.00"
          value={values.amount}
          onChange={(event) => onChange("amount", event.target.value)}
        />
      </label>

      <label className="grid w-full min-w-0 gap-2 md:col-span-1">
        <span className="text-[14px] font-medium leading-none text-ink">
          Currency
        </span>
        <div className="relative min-w-0">
          <select
            className={`${fieldClass} appearance-none pl-[52px] pr-10`}
            value={values.currency}
            onChange={(event) => onChange("currency", event.target.value)}
          >
            <option value="USDC">USDC</option>
          </select>
          <span className="pointer-events-none absolute left-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#bfd8f2] bg-[#f3f8ff] text-[15px] font-semibold text-[#2d7bd3]">
            $
          </span>
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3d3d3d]"
            strokeWidth={1.8}
          />
        </div>
      </label>

      <label className="grid w-full min-w-0 gap-2 md:col-span-2">
        <span className="text-[14px] font-medium leading-none text-ink">
          Receiver wallet address
        </span>
        <input
          className={fieldClass}
          placeholder="0x1234...abcd5678efgh9012ijkl3456mnop7890"
          value={values.walletAddress}
          onChange={(event) => onChange("walletAddress", event.target.value)}
        />
      </label>

      <label className="grid w-full min-w-0 gap-2 md:col-span-2">
        <span className="text-[14px] font-medium leading-none text-ink">
          Redirect URL (optional)
        </span>
        <input
          className={fieldClass}
          placeholder="https://yourwebsite.com/thank-you"
          value={values.redirectUrl}
          onChange={(event) => onChange("redirectUrl", event.target.value)}
        />
      </label>

      <div className="mt-2 grid w-full min-w-0 gap-3 sm:grid-cols-[minmax(0,286px)_max-content] sm:items-center md:col-span-2">
        <button
          type="submit"
          disabled={isGenerating}
          className="h-12 w-full rounded-[10px] bg-ink px-6 text-[15px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_18px_rgba(20,20,20,0.09)] transition hover:bg-black disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-white"
        >
          {isGenerating ? "Generating..." : "Generate link"}
        </button>
        <button
          type="button"
          className="h-12 w-full rounded-[10px] px-4 text-[14px] font-medium text-[#55514b] transition hover:bg-[#f5f2ed] focus:outline-none focus:ring-2 focus:ring-line focus:ring-offset-2 focus:ring-offset-white sm:w-auto sm:px-5"
          onClick={onTryExample}
        >
          Try example
        </button>
      </div>
    </form>
  );
}
