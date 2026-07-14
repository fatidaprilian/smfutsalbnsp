import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { NavBar } from "@/components/navbar";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

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
      <body className={`${jakarta.variable} font-sans min-h-screen bg-[#F8F9FA] text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white`}>
        <NavBar role={session?.role as "ADMIN" | "CUSTOMER" | undefined} />
        <main className="pt-24 pb-12 min-h-[calc(100vh-5rem)] flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
