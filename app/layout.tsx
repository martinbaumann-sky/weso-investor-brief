import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-weso-body", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-weso-display", subsets: ["latin"] });

const image = "https://weso.click/og.png?v=20260903b";
const title = "Weso — The AI Operations Layer for Insurance Services";
const description = "AI-native, real-time insurance service infrastructure with usage-based economics.";

export const metadata: Metadata = {
  title,
  description,
  icons: { icon: "/favicon.jpg", shortcut: "/favicon.jpg", apple: "/favicon.jpg" },
  openGraph: { title, description, type: "website", images: [{ url: image, width: 1734, height: 907, alt: title }] },
  twitter: { card: "summary_large_image", title, description, images: [image] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>{children}</body>
    </html>
  );
}
