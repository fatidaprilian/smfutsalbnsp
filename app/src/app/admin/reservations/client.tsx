"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelReservation } from "@/actions/reservation";

type Court = { id: string; name: string; type: string; pricePerHour: number };
type Reservation = {
  id: string;
  courtId: string;
  date: string;
  startHour: number;
  endHour: number;
  totalPrice: number;
  status: string;
  paymentType: string;
  court: { name: string; type: string };
  user: { name: string; email: string };
  createdAt: string;
};

export function AdminReservationClient({
  reservations,
  courts,
  filters,
}: {
  reservations: Reservation[];
  courts: Court[];
  filters: { query?: string; courtId?: string; date?: string; status?: string };
}) {
  const router = useRouter();
  const [query, setQuery] = useState(filters.query || "");
  const [courtId, setCourtId] = useState(filters.courtId || "");
  const [date, setDate] = useState(filters.date || "");
  const [status, setStatus] = useState(filters.status || "");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (courtId) params.set("courtId", courtId);
    if (date) params.set("date", date);
    if (status) params.set("status", status);
    router.push(`/admin/reservations?${params.toString()}`);
  };

  const clearFilters = () => {
    setQuery("");
    setCourtId("");
    setDate("");
    setStatus("");
    router.push("/admin/reservations");
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Yakin ingin membatalkan reservasi ini?")) return;
    await cancelReservation(id);
    router.refresh();
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Semua Reservasi</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama/email/lapangan..."
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={courtId}
            onChange={(e) => setCourtId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Lapangan</option>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu Bayar</option>
            <option value="CONFIRMED">Dikonfirmasi</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="flex-1 py-2 px-4 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Filter
            </button>
            <button
              onClick={clearFilters}
              className="py-2 px-4 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {reservations.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">Tidak ada reservasi ditemukan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Pelanggan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Lapangan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Tanggal</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Waktu</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{r.user.name}</div>
                      <div className="text-xs text-gray-400">{r.user.email}</div>
                    </td>
                    <td className="py-3 px-4">{r.court.name}</td>
                    <td className="py-3 px-4">
                      {new Date(r.date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3 px-4">
                      {String(r.startHour).padStart(2, "0")}:00 – {String(r.endHour).padStart(2, "0")}:00
                    </td>
                    <td className="py-3 px-4">
                      {formatPrice(r.totalPrice)}
                      <span className="block mt-1 text-[10px] uppercase font-bold text-gray-500">
                        {r.paymentType === "DP" ? "DP 50%" : "LUNAS"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : r.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : r.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {r.status === "CONFIRMED" ? "Dikonfirmasi" : r.status === "PENDING" ? "Menunggu Bayar" : r.status === "COMPLETED" ? "Selesai" : "Dibatalkan"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-2">
                        {r.status === "CONFIRMED" && r.paymentType === "DP" && (
                          <button
                            onClick={async () => {
                              if(confirm("Pelanggan sudah melunasi sisa tagihan di kasir?")) {
                                const { completeReservation } = await import('@/actions/reservation');
                                await completeReservation(r.id);
                              }
                            }}
                            className="text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-[10px] font-medium transition-colors w-max shadow-sm"
                          >
                            Pelunasan
                          </button>
                        )}
                        {(r.status === "CONFIRMED" || r.status === "PENDING") && (
                          <button
                            onClick={() => handleCancel(r.id)}
                            className="text-red-600 hover:underline text-xs cursor-pointer text-left w-max"
                          >
                            Batalkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Menampilkan {reservations.length} reservasi
      </p>
    </div>
  );
}
