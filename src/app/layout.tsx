import type { Metadata } from "next";
import { Geist, Cormorant_Garamond, Outfit } from "next/font/google";
import { LangProvider } from "@/i18n/context";
import CookieBanner from "@/components/CookieBanner";
import WhatsAppButton from "@/components/WhatsAppButton";
import Script from "next/script";
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

export const metadata: Metadata = {
  title: "The Eternal Memory — Where memories never fade.",
  description:
    "Hayatınız boyunca biriktirdiğiniz anıları, hikayelerinizi ve dijital mirasınızı güvenle saklayın ve sevdiklerinize bırakın.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  icons: {
    icon: [{ url: '/images/logo-mark.png', type: 'image/png' }],
    apple: [{ url: '/images/logo-mark.png', type: 'image/png', sizes: '180x180' }],
  },
  openGraph: {
    title: "The Eternal Memory — Where memories never fade.",
    description: "Anılarınız sonsuza kadar güvende.",
    type: "website",
    siteName: "The Eternal Memory",
  },
  twitter: {
    card: 'summary',
    title: "The Eternal Memory",
    description: "Anılarınız sonsuza kadar güvende.",
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LX3BRV79MJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-LX3BRV79MJ');
        `}</Script>
        <LangProvider serverLang={lang}>
          {children}
          <CookieBanner />
          <WhatsAppButton />
        </LangProvider>
      </body>
    </html>
  );
}
