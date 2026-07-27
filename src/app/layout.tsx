import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

// Sans/heading fonts (Sofia Pro, FreightBig Pro) are commercial and not
// bundled yet — see the note in globals.css. Geist Mono is free and kept
// for any monospace use (e.g. admin numeric displays).
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Norfolk Yarn",
  description: "A knitters' paradise — yarn, books, needles, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
