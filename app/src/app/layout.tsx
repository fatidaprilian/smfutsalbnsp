import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { NavBar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SM Sport Center",
  description: "Sistem Reservasi Lapangan Olahraga Premium",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-500 selection:text-white`}>
        <NavBar role={session?.role as "ADMIN" | "CUSTOMER" | undefined} />
        <main className="pt-20 pb-10 min-h-[calc(100vh-4rem)] flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
