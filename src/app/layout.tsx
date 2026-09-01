import type { Metadata } from "next";
import { portfolio } from "@/data/portfolio";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(portfolio.siteUrl),
  title: `${portfolio.name} — ${portfolio.role}`,
  description: "The personal portfolio of Sumeet Basfore, a software developer building across applications, systems, and hardware.",
  alternates: { canonical: "/" },
  openGraph: {
    title: `${portfolio.name} — ${portfolio.role}`,
    description: portfolio.intro,
    url: "/",
    siteName: portfolio.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${portfolio.name} — ${portfolio.role}`,
    description: portfolio.intro,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
