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
    <nav className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center">
          <Link href={role === "ADMIN" ? "/admin/reservations" : "/reservations"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              SM<span className="text-blue-600">Sport</span>
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
                className={`relative py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-blue-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
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
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{role}</p>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 cursor-pointer"
                >
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Masuk
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-full transition-colors shadow-sm shadow-blue-500/30">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
