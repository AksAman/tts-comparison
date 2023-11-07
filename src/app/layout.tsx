import "@/styles/globals.css";
import Toaster from "@/components/utilities/Toaster";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

import { Inter } from "next/font/google";
import Footer from "@/components/custom/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TTS Comparison",
  metadataBase: new URL("https://tts-comparison.vercel.app/"),

  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "TTS Comparison",
    description: "A comparison of various TTS Providers",
    url: "https://tts-comparison.vercel.app/",
    images: [
      {
        url: "/og.png",
        width: 1700,
        height: 640,
        alt: "TTS Comparison",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} mb-12 bg-gray-50`}>
        {children}
        <Toaster richColors closeButton />
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
