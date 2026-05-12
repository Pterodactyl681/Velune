import { NextResponse } from "next/server";

type CreateLinkRequest = {
  name?: string;
  price?: number;
  currency?: string;
  receiver?: string;
  redirectUrl?: string;
};

function makeMockUrl() {
  const id = Math.random().toString(36).slice(2, 10);
  return `https://velune-mocha.vercel.app/success?demo=${id}`;
}

function cleanErrorText(text: string) {
  if (!text) return "Unknown error";

  // Если KiraPay вернул HTML/Cloudflare — не показываем простыню пользователю
  if (text.includes("<!DOCTYPE html") || text.includes("<html")) {
    return "KiraPay API is temporarily unavailable.";
  }

  try {
    const parsed = JSON.parse(text);
    return parsed?.message || parsed?.error || text;
  } catch {
    return text.slice(0, 180);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateLinkRequest;

    const name = body.name?.trim();
    const price = Number(body.price);
    const currency = body.currency?.trim() || "USDC";
    const receiver = body.receiver?.trim();
    const redirectUrl = body.redirectUrl?.trim();

    if (!name) {
      return NextResponse.json({ ok: false, error: "Payment description is required." }, { status: 400 });
    }

    if (!price || Number.isNaN(price) || price <= 0) {
      return NextResponse.json({ ok: false, error: "Amount must be a positive number." }, { status: 400 });
    }

    if (!currency) {
      return NextResponse.json({ ok: false, error: "Currency is required." }, { status: 400 });
    }

    if (!receiver) {
      return NextResponse.json({ ok: false, error: "Receiver wallet address is required." }, { status: 400 });
    }

    if (!redirectUrl) {
      return NextResponse.json({ ok: false, error: "Redirect URL is required." }, { status: 400 });
    }

    try {
      new URL(redirectUrl);
    } catch {
      return NextResponse.json({ ok: false, error: "Redirect URL must be valid." }, { status: 400 });
    }

    const apiKey = process.env.KIRAPAY_API_KEY;

    const requestPayload = {
      price,
      currency,
      receiver,
      name,
      redirectUrl,
    };

    // Если ключа нет — честный mock mode
    if (!apiKey) {
      return NextResponse.json({
        ok: true,
        url: makeMockUrl(),
        mode: "mock",
        warning: "KIRAPAY_API_KEY is missing. Using demo mode.",
        request: requestPayload,
      });
    }

    const response = await fetch("https://kirapay-api.holatech.app/api/link/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(requestPayload),
      cache: "no-store",
    });

    const responseText = await response.text();

    if (!response.ok) {
      const cleanMessage = cleanErrorText(responseText);

      // Внешний KiraPay API временно лежит — не ломаем демку, но честно ставим mock
      if ([521, 502, 503, 504].includes(response.status)) {
        return NextResponse.json({
          ok: true,
          url: makeMockUrl(),
          mode: "mock",
          warning: `KiraPay API unavailable (${response.status}). Demo fallback used.`,
          request: requestPayload,
        });
      }

      return NextResponse.json(
        {
          ok: false,
          error: `KiraPay API request failed: ${response.status} ${cleanMessage}`,
        },
        { status: response.status }
      );
    }

    let data: any;

    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "KiraPay API returned an invalid response.",
        },
        { status: 502 }
      );
    }

    const url = data?.data?.url;

    if (!url) {
      return NextResponse.json(
        {
          ok: false,
          error: "KiraPay API did not return a payment link.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      url,
      mode: "live",
      request: requestPayload,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Unexpected server error while creating payment link.",
      },
      { status: 500 }
    );
  }
}
