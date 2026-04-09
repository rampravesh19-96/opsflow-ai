import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpsFlow AI",
  description: "AI-assisted operations control center for ecommerce orders.",
  metadataBase: process.env.APP_URL ? new URL(process.env.APP_URL) : undefined,
  robots: {
    follow: false,
    index: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
