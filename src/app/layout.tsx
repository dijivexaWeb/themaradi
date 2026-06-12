import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { LangProvider } from "@/i18n/context";
import CookieBanner from "@/components/CookieBanner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Eternal Memory — Where memories never fade.",
  description:
    "Hayatınız boyunca biriktirdiğiniz anıları, hikayelerinizi ve dijital mirasınızı güvenle saklayın ve sevdiklerinize bırakın.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  icons: {
    icon: [{ url: '/icon', type: 'image/png', sizes: '32x32' }],
    apple: [{ url: '/apple-icon', type: 'image/png', sizes: '180x180' }],
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
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <LangProvider serverLang={lang}>
          {children}
          <CookieBanner />
        </LangProvider>
      </body>
    </html>
  );
}
