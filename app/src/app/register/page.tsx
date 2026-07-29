"use client";

import { useActionState } from "react";
import { registerCustomer } from "@/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(registerCustomer, {});

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Buat Akun</h1>
            <p className="text-sm text-slate-500">Mulai reservasi lapangan dengan mudah</p>
          </div>

          {state.error && (
            <div className="mb-6 p-4 bg-red-50/50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium">{state.error}</span>
            </div>
          )}

          <form action={action} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="name">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  state.fieldErrors?.name
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Budi Santoso"
              />
              {state.fieldErrors?.name && (
                <p className="mt-1 text-sm text-red-600 font-medium">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">
                Alamat Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  state.fieldErrors?.email
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="budi@email.com"
              />
              {state.fieldErrors?.email && (
                <p className="mt-1 text-sm text-red-600 font-medium">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="phone">
                Nomor Telepon / WA
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  state.fieldErrors?.phone
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="081234567890"
              />
              {state.fieldErrors?.phone && (
                <p className="mt-1 text-sm text-red-600 font-medium">
                  {state.fieldErrors.phone[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  state.fieldErrors?.password
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Minimal 8 karakter"
              />
              {state.fieldErrors?.password && (
                <p className="mt-1 text-sm text-red-600 font-medium">
                  {state.fieldErrors.password[0]}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-70 cursor-pointer shadow-lg shadow-blue-500/25 mt-2"
            >
              {isPending ? "Memproses..." : "Daftar Akun"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
