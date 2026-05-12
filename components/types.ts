export type LinkStatus = "Live" | "Mock";

export type PaymentMode = "live" | "mock";

export type PaymentFormValues = {
  description: string;
  amount: string;
  currency: "USDC";
  walletAddress: string;
  redirectUrl: string;
};

export type RecentLink = {
  id: string;
  description: string;
  amount: string;
  currency: string;
  status: LinkStatus;
  url: string;
  createdAt: number;
};

export type CreateLinkSuccess = {
  ok: true;
  url: string;
  mode: PaymentMode;
  request: {
    name: string;
    price: number;
    currency: "USDC";
    receiver: string;
    redirectUrl: string;
  };
};

export type CreateLinkError = {
  ok: false;
  error: string;
};

export type CreateLinkResponse = CreateLinkSuccess | CreateLinkError;
