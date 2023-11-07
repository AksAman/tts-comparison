import "@/styles/globals.css";
import Toaster from "@/components/utilities/Toaster";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "TTS Comparison",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} bg-gray-50 `}>
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
