import type { Metadata } from "next";
import { Abhaya_Libre, Josefin_Sans } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-context";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import "./globals.css";

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const abhayaLibre = Abhaya_Libre({
  variable: "--font-abhaya-libre",
  subsets: ["latin"],
  weight: ["700"],
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
    <html lang="en" className={`${josefinSans.variable} ${abhayaLibre.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
