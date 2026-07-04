import type { Metadata } from "next";
import { Geist, Cormorant_Garamond, Outfit } from "next/font/google";
import { LangProvider } from "@/i18n/context";
import CookieBanner from "@/components/CookieBanner";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Suspense } from "react";
import AnalyticsConsentGate from "@/components/AnalyticsConsentGate";
import { buildAlternateLanguages } from "@/lib/i18n/hreflang";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://theeternalmemory.com'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'The Eternal Memory — Dijital Anma Profili & QR Mezar Taşı',
    template: '%s — The Eternal Memory',
  },
  description:
    'Sevdikleriniz için kalıcı dijital anma profili oluşturun. Fotoğraflar, hayat hikayesi, aile ağacı ve QR mezar taşı. Gürcistan, Türkiye ve dünya genelinde hizmet.',
  keywords: [
    'dijital anma', 'dijital mezar', 'online anma profili', 'QR mezar taşı',
    'dijital miras', 'anı sayfası', 'memorial profile', 'digital memorial',
    'ციფრული მემორიალი', 'QR საფლავის ქვა', 'მოგონებების გვერდი',
    'цифровой мемориал', 'онлайн-мемориал',
  ],
  authors: [{ name: 'The Eternal Memory', url: APP_URL }],
  creator: 'The Eternal Memory',
  publisher: 'The Eternal Memory',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: [{ url: '/images/logo-mark.png', type: 'image/png' }],
    apple: [{ url: '/images/logo-mark.png', type: 'image/png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'The Eternal Memory — Dijital Anma Profili & QR Mezar Taşı',
    description: 'Sevdikleriniz için kalıcı dijital anma profili oluşturun. Fotoğraflar, hayat hikayesi, QR mezar taşı.',
    type: 'website',
    siteName: 'The Eternal Memory',
    url: APP_URL,
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Eternal Memory — Dijital Anma Profili',
    description: 'Sevdikleriniz için kalıcı dijital anma profili. QR mezar taşı, fotoğraflar, aile ağacı.',
    site: '@eternalmemoryco',
  },
  alternates: {
    canonical: APP_URL,
    languages: buildAlternateLanguages('/'),
  },
};

import { getTranslation } from "@/i18n/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lang } = await getTranslation()
  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${cormorantGaramond.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <Suspense fallback={null}>
          <AnalyticsConsentGate />
        </Suspense>
        <LangProvider serverLang={lang}>
          {children}
          <CookieBanner />
          <WhatsAppButton />
        </LangProvider>
      </body>
    </html>
  );
}
