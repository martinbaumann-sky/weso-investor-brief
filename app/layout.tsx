import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-weso-body", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-weso-display", subsets: ["latin"] });

const image = "https://weso.click/og-es.png?v=20261008";
const title = "Weso — La capa operativa de servicios para asegurados, impulsada por IA.";
const description = "Una infraestructura de coordinación en tiempo real que conecta a asegurados y operadores de servicios, impulsada por IA.";

export const metadata: Metadata = {
  title,
  description,
  icons: { icon: "/favicon.jpg", shortcut: "/favicon.jpg", apple: "/favicon.jpg" },
  openGraph: { title, description, type: "website", locale: "es_CL", images: [{ url: image, width: 1200, height: 630, alt: title }] },
  twitter: { card: "summary_large_image", title, description, images: [image] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>{children}</body>
    </html>
  );
}
