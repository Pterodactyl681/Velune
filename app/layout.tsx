import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Velune",
  description: "Create clean payment links.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
