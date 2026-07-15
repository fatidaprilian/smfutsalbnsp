"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";

export function NavBar({ role }: { role?: "ADMIN" | "CUSTOMER" }) {
  const pathname = usePathname();

  let links: { href: string; label: string }[] = [];
  if (role === "ADMIN") {
    links = [
      { href: "/admin/reservations", label: "Kelola Reservasi" },
      { href: "/admin/laporan", label: "Laporan" },
    ];
  } else if (role === "CUSTOMER") {
    links = [{ href: "/reservations", label: "Reservasi Lapangan" }];
  }

  return (
    <nav className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 transition-all duration-300 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center shadow-md group-hover:rotate-3 transition-transform">
              <svg className="w-5 h-5 text-[#CCFF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-zinc-950">
              SM<span className="text-zinc-500 font-bold">Sport.</span>
            </span>
          </Link>
        </div>

        {/* Links */}
        <div className="hidden sm:flex sm:items-center sm:gap-8">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 text-sm font-bold transition-colors ${
                  isActive ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-950 rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {role ? (
            <>
              <div className="hidden sm:block text-right">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{role}</p>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                >
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-zinc-600 hover:text-zinc-950 transition-colors">
                Masuk
              </Link>
              <Link href="/register" className="px-5 py-2.5 text-sm font-bold bg-zinc-950 text-white hover:bg-zinc-800 rounded-xl transition-all shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] active:scale-95">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
