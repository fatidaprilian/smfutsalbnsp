"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkReservationStatus } from "@/actions/reservation";
import { Reservation } from "../types";

export function PaymentModal({
  payModalId,
  reservations,
  onClose,
}: {
  payModalId: string | null;
  reservations: Reservation[];
  onClose: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!payModalId) return;
    const interval = setInterval(async () => {
      const status = await checkReservationStatus(payModalId);
      if (status === "CONFIRMED") {
        onClose();
        router.refresh();
        alert("Pembayaran Berhasil Dikonfirmasi!");
      }
    }, 3000); // Cek tiap 3 detik
    return () => clearInterval(interval);
  }, [payModalId, router, onClose]);

  if (!payModalId) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const reservation = reservations.find((r) => r.id === payModalId);
  const amountToPay =
    reservation?.paymentType === "DP"
      ? (reservation.totalPrice || 0) / 2
      : reservation?.totalPrice || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Scan untuk Membayar</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="p-6 flex flex-col items-center">
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Tagihan</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(amountToPay)}
            </p>
            <p className="text-sm font-medium text-blue-600 mt-1 bg-blue-50 py-1.5 px-3 rounded-full inline-block">
              {reservation?.paymentType === "DP" ? "DP 50%" : "Lunas 100%"}
            </p>
          </div>
          <div className="bg-white p-3 border-2 border-gray-100 rounded-xl shadow-inner">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                typeof window !== "undefined"
                  ? `${window.location.origin}/pay/${payModalId}`
                  : ""
              )}`}
              alt="QR Code Pembayaran"
              className="w-48 h-48 object-contain"
            />
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center px-4">
            Buka aplikasi E-Wallet (GoPay, OVO, Dana) atau m-Banking Anda, lalu
            scan QR Code ini.
          </p>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
          <p className="text-sm text-gray-500 font-medium">
            Atau scan pakai kamera HP
          </p>
        </div>
      </div>
    </div>
  );
}
