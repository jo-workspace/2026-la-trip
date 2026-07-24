import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "LA Trip 2026",
  description: "2026 洛杉磯旅遊行程與隨身助理",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon_la_trip.png", type: "image/png" }
    ],
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-800 font-sans selection:bg-slate-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
