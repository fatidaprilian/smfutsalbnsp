"use client";

import { Reservation } from "../types";

export function BookingTicketModal({
  ticketModalId,
  reservations,
  onClose,
}: {
  ticketModalId: string | null;
  reservations: Reservation[];
  onClose: () => void;
}) {
  if (!ticketModalId) return null;

  const reservation = reservations.find((r) => r.id === ticketModalId);
  if (!reservation) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:bg-white print:p-0">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden print:shadow-none print:max-w-full">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center print:hidden">
          <h3 className="font-semibold text-gray-800">Bukti Pemesanan</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>
        
        <div className="p-8 print:p-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">SM Futsal & Badminton</h2>
            <p className="text-sm text-gray-500">Bukti Reservasi Lapangan</p>
          </div>

          <div className="space-y-4 text-sm mb-8">
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-gray-500">ID Reservasi</span>
              <span className="font-medium font-mono text-gray-900">{reservation.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-gray-500">Status</span>
              <span className={`font-bold ${reservation.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'}`}>
                {reservation.status}
              </span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-gray-500">Lapangan</span>
              <span className="font-medium text-gray-900">{reservation.court.name}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-gray-500">Tanggal Main</span>
              <span className="font-medium text-gray-900">{new Date(reservation.date).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-gray-500">Waktu</span>
              <span className="font-medium text-gray-900">
                {String(reservation.startHour).padStart(2, "0")}:00 - {String(reservation.endHour).padStart(2, "0")}:00
              </span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-gray-500">Total Harga</span>
              <span className="font-medium text-gray-900">{formatPrice(reservation.totalPrice)}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
              <span className="text-gray-500">Tipe Pembayaran</span>
              <span className="font-medium text-gray-900">{reservation.paymentType === "DP" ? "DP 50%" : "Lunas 100%"}</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${reservation.id}`}
              alt="QR Code Tiket"
              className="w-32 h-32 object-contain mix-blend-multiply"
            />
            <p className="text-xs text-gray-400 mt-2">Tunjukkan QR Code ini kepada Admin</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Cetak Tiket / PDF
          </button>
        </div>
      </div>
    </div>
  );
}
