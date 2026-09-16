import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#030712",
};

export const metadata: Metadata = {
  title: "Sigurnost na Internetu | Kviz za 9. razred",
  description: "Interaktivni kviz o sajber bezbjednosti za učenike 9. razreda OŠ Petar Petrović Njegoš Banja Luka.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sigurnost Kviz",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden touch-manipulation">
        {children}
      </body>
    </html>
  );
}
