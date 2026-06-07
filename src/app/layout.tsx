import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { LangProvider } from "@/i18n/context";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "themaradi — Dijital Miras Kasası",
  description:
    "Hayatınız boyunca biriktirdiğiniz anıları, hikayelerinizi ve dijital mirasınızı güvenle saklayın ve sevdiklerinize bırakın.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "themaradi — Dijital Miras Kasası",
    description: "Anılarınız sonsuza kadar güvende.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
