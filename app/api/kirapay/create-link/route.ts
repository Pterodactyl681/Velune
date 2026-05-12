import { NextResponse } from "next/server";

const KIRAPAY_GENERATE_URL =
  "https://kirapay-api.holatech.app/api/link/generate";

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
  message?: unknown;
  error?: unknown;
  data?: {
    url?: unknown;
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

function cleanMessage(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 300);
}

function parseKiraPayPayload(responseText: string): KiraPayResponse | null {
  if (!responseText.trim()) {
    return null;
  }

  try {
    return JSON.parse(responseText) as KiraPayResponse;
  } catch {
    return null;
  }
}

function getResponseMessage(payload: KiraPayResponse | null) {
  if (typeof payload?.message === "string" && payload.message.trim()) {
    return cleanMessage(payload.message);
  }

  if (typeof payload?.error === "string" && payload.error.trim()) {
    return cleanMessage(payload.error);
  }

  return "";
}

function kiraPayError(status: number, message: string) {
  return errorResponse(
    `KiraPay API request failed: ${status} ${message}`,
    status,
  );
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
    const response = await fetch(KIRAPAY_GENERATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(normalized),
      cache: "no-store",
    });

    const responseText = await response.text();
    const payload = parseKiraPayPayload(responseText);

    if (!response.ok) {
      return kiraPayError(
        response.status,
        getResponseMessage(payload) ||
          cleanMessage(responseText) ||
          response.statusText ||
          "KiraPay could not create the payment link.",
      );
    }

    const url = payload?.data?.url;
    if (typeof url !== "string" || !url.trim()) {
      return kiraPayError(
        502,
        "KiraPay response did not include a payment URL.",
      );
    }

    return NextResponse.json({
      ok: true,
      url: url.trim(),
      mode: "live",
      request: normalized,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return errorResponse(
      `KiraPay API request failed: network error ${message}`,
      502,
    );
  }
}
