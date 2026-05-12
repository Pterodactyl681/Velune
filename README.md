

````md
# Velune

**Create clean payment links.**

Velune is a minimal payment-link interface built on top of KiraPay.  
It lets freelancers, creators, and AI-agent builders generate clean checkout links and embeddable payment buttons without sending users through a full merchant dashboard.

Velune is not trying to replace KiraPay.  
It is a focused frontend layer that makes KiraPay easier to use inside real product flows.

---

## Why Velune exists

KiraPay provides the payment infrastructure.

Velune provides the lightweight user experience around it.

Many small digital services do not need a full payment dashboard every time they want to request payment. They need a fast, clean way to create a checkout link, share it with a client, or paste a payment button into a website.

Velune solves that small but real gap.

Use cases:

- Freelancers requesting payment for completed work
- Creators accepting support or one-time payments
- AI-agent builders charging for completed tasks
- Small SaaS tools that need a simple checkout launcher
- Builders who want an embeddable payment button powered by KiraPay

---

## What it does

Velune lets a user enter:

- payment description
- amount
- currency
- receiver wallet address
- redirect URL

Then Velune creates a payment link through a secure server-side KiraPay API route.

After generation, the user can:

- copy the payment link
- open the checkout page
- view recent generated links
- copy an embeddable HTML payment button
- paste that button into any website

---

## Core feature: Embeddable payment buttons

Velune does not stop at generating a link.

After a payment link is created, Velune also generates a ready-to-use HTML button:

```html
<a
  href="PAYMENT_LINK"
  target="_blank"
  rel="noopener noreferrer"
  style="display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:12px;background:#111;color:#fff;text-decoration:none;font-family:system-ui;font-size:14px;font-weight:600;"
>
  Pay 12 USDC
</a>
````

This makes Velune useful for builders who want to add payment collection to a landing page, portfolio, agent interface, or small product without building a payment UI from scratch.

---

## How it uses KiraPay

Velune uses the KiraPay payment link API from a secure backend route.

The frontend never sees the API key.

Flow:

```txt
User fills payment form
        ↓
Frontend calls /api/kirapay/create-link
        ↓
Next.js server route validates the request
        ↓
Server calls KiraPay /link/generate with KIRAPAY_API_KEY
        ↓
Velune returns a checkout link to the UI
```

The API key is read only on the server:

```ts
process.env.KIRAPAY_API_KEY
```

No secret is exposed to the client.

---

## Live mode and demo fallback

Velune supports two modes.

### Live mode

If `KIRAPAY_API_KEY` is configured, Velune attempts to create a real KiraPay payment link.

### Demo mode

If the API key is missing or the external KiraPay API is temporarily unavailable, Velune can fall back to demo mode so the user flow stays testable instead of breaking.

This keeps the interface usable even during external API downtime.

---

## Features

* Minimal light UI
* Clean payment-link form
* Secure server-side KiraPay API integration
* Live/Demo mode indicator
* Recent links stored locally
* Copy payment link
* Open checkout in a new tab
* Embeddable HTML payment button generator
* Copy embed code
* Mobile-friendly layout
* No exposed API keys
* No wallet or dashboard complexity

---

## Tech stack

* Next.js App Router
* TypeScript
* Tailwind CSS
* KiraPay API
* Vercel-ready deployment

---

## Project structure

```txt
app/
  api/
    kirapay/
      create-link/
        route.ts
  success/
    page.tsx
  page.tsx

components/
  PaymentLinkGenerator.tsx
  PaymentResult.tsx
  PaymentForm.tsx
  RecentLinks.tsx
  StatusBadge.tsx
  BrandHeader.tsx

lib/
  utils.ts
```

---

## Environment variables

Create a `.env.local` file:

```env
KIRAPAY_API_KEY=your_kirapay_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, set these variables in your deployment provider:

```env
KIRAPAY_API_KEY=your_kirapay_api_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

Important:

```txt
Never commit .env.local.
Never expose KIRAPAY_API_KEY in frontend code.
```

---

## Local setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Build for production:

```bash
npm run build
```

---

## Deployment

Velune is ready to deploy on Vercel.

Required environment variables:

```env
KIRAPAY_API_KEY=
NEXT_PUBLIC_APP_URL=
```

After changing environment variables in Vercel, redeploy the project so the new values are applied.

---

## Example flow

1. Open Velune
2. Enter a payment description
3. Enter amount and receiver wallet
4. Generate a KiraPay-powered checkout link
5. Copy the payment link
6. Copy the generated embed button
7. Paste the button into a website

---

## Example use cases

### Freelancer payment request

A freelance developer finishes a landing page and creates a payment link for the client.

### Creator support

A creator creates a simple support payment button and embeds it into a personal website.

### AI-agent task payment

An AI-agent builder creates payment links for completed tasks such as research, summaries, design work, or automated services.

### Small product checkout

A builder adds a lightweight payment button to a small tool without creating a full custom checkout system.

---

## Security notes

Velune keeps payment API access on the server.

The frontend only calls:

```txt
/api/kirapay/create-link
```

The backend route is responsible for:

* validating request data
* reading the KiraPay API key
* calling the KiraPay API
* returning a normalized response

Secrets are never sent to the browser.

---

## Future improvements

* Hosted public payment pages
* Saved payment templates
* Team workspaces
* Custom button themes
* Webhook-based payment status updates
* Agent-generated payment requests
* Analytics for link opens and completed payments
* Embeddable React component
* Multi-currency support

---

## Philosophy

Velune is intentionally small.

The goal is not to build another complex payment dashboard.
The goal is to make KiraPay payment links easier to use in real websites, portfolios, creator pages, and agent workflows.

Clean interface.
Fast link generation.
Embeddable payment buttons.
No unnecessary complexity.

```


