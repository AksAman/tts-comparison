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
      <body className={`font-sans ${inter.variable} mb-12 bg-gray-50`}>
        {children}
        <Toaster richColors closeButton />
        <footer className="fixed bottom-0 flex h-12 w-full items-center bg-gray-900 px-2 text-white">
          Note: No API keys leave your browser and are stored in local storage.
        </footer>
      </body>
    </html>
  );
}
