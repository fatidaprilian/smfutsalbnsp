"use client";

import { useTransition } from "react";
import { processWalletPayment } from "@/actions/reservation";
import { useRouter } from "next/navigation";

export function PayClient({ reservation }: { reservation: any }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePay = () => {
    startTransition(async () => {
      const res = await processWalletPayment(reservation.id);
      if (res.success) {
        // Just refresh to show success state
        router.refresh();
      } else {
        alert(res.error || "Gagal memproses pembayaran");
      }
    });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const amountToPay =
    reservation.paymentType === "DP"
      ? reservation.totalPrice / 2
      : reservation.totalPrice;

  if (reservation.status !== "PENDING") {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil</h2>
        <p className="text-gray-500 mb-6">
          Terima kasih, pembayaran untuk reservasi ini telah kami terima.
        </p>
        <button
          onClick={() => router.push("/")}
          className="text-blue-600 font-medium hover:underline cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 mb-2">Total Tagihan</p>
        <p className="text-4xl font-extrabold text-gray-900">
          {formatPrice(amountToPay)}
        </p>
        <div className="mt-3">
          <span className="inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
            {reservation.paymentType === "DP" ? "DP 50%" : "Lunas 100%"}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-2xl mb-8 space-y-3 border border-gray-100 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Penyewa</span>
          <span className="font-medium text-gray-900">{reservation.user.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Lapangan</span>
          <span className="font-medium text-gray-900">{reservation.court.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Tanggal</span>
          <span className="font-medium text-gray-900">
            {new Date(reservation.date).toLocaleDateString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Waktu</span>
          <span className="font-medium text-gray-900">
            {String(reservation.startHour).padStart(2, "0")}:00 - {String(reservation.endHour).padStart(2, "0")}:00
          </span>
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={isPending}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
      >
        {isPending ? "Memproses..." : "Bayar Sekarang"}
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        Pembayaran Aman & Terverifikasi
      </p>
    </div>
  );
}
