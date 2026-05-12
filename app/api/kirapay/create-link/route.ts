import { NextResponse } from "next/server";

const KIRAPAY_BASE_URL = "https://kirapay-api.holatech.app/api";

type CreateLinkRequest = {
  name?: unknown;
  price?: unknown;
  currency?: unknown;
  receiver?: unknown;
  redirectUrl?: unknown;
};

type NormalizedRequest = {
  name: string;
  price: number;
  currency: "USDC";
  receiver: string;
  redirectUrl: string;
};

type KiraPayResponse = {
  message?: string;
  data?: {
    url?: string;
  };
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeRequest(body: CreateLinkRequest): NormalizedRequest | string {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return "Payment description is required.";
  }

  const price =
    typeof body.price === "number"
      ? body.price
      : typeof body.price === "string"
        ? Number.parseFloat(body.price)
        : Number.NaN;

  if (!Number.isFinite(price) || price <= 0) {
    return "Amount must be a positive number.";
  }

  const currency = typeof body.currency === "string" ? body.currency.trim() : "";
  if (!currency) {
    return "Currency is required.";
  }

  if (currency !== "USDC") {
    return "Currency must be USDC.";
  }

  const receiver =
    typeof body.receiver === "string" ? body.receiver.trim() : "";
  if (!receiver) {
    return "Receiver wallet address is required.";
  }

  const redirectUrl =
    typeof body.redirectUrl === "string" ? body.redirectUrl.trim() : "";
  if (!redirectUrl || !isValidUrl(redirectUrl)) {
    return "Redirect URL must be a valid URL.";
  }

  return {
    name,
    price,
    currency,
    receiver,
    redirectUrl,
  };
}

function createDemoUrl() {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 13)
      : Math.random().toString(36).slice(2, 15);

  return `https://pay.velune.app/checkout/demo-${randomId}`;
}

export async function POST(request: Request) {
  let body: CreateLinkRequest;

  try {
    body = (await request.json()) as CreateLinkRequest;
  } catch {
    return errorResponse("Request body must be valid JSON.");
  }

  const normalized = normalizeRequest(body);
  if (typeof normalized === "string") {
    return errorResponse(normalized);
  }

  const apiKey = process.env.KIRAPAY_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      url: createDemoUrl(),
      mode: "mock",
      request: normalized,
    });
  }

  try {
    const response = await fetch(`${KIRAPAY_BASE_URL}/link/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(normalized),
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | KiraPayResponse
      | null;

    if (!response.ok) {
      return errorResponse(
        payload?.message || "KiraPay could not create the payment link.",
        response.status,
      );
    }

    const url = payload?.data?.url;
    if (!url) {
      return errorResponse("KiraPay response did not include a payment URL.", 502);
    }

    return NextResponse.json({
      ok: true,
      url,
      mode: "live",
      request: normalized,
    });
  } catch {
    return errorResponse("Unable to reach KiraPay. Please try again.", 502);
  }
}
