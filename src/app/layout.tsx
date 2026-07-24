import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Keter Quotes — Devis & Factures",
  description:
    "Générateur de devis et factures pour Keter Marketing — CV & LinkedIn optimization services.",
  keywords: ["Keter Marketing", "Devis", "Facture", "Quote", "Invoice", "CV", "LinkedIn"],
  authors: [{ name: "Keter Marketing" }],
  icons: {
    icon: "/keter-logo.png",
  },
  openGraph: {
    title: "Keter Quotes",
    description: "Générateur de devis & factures",
    siteName: "Keter Marketing",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
