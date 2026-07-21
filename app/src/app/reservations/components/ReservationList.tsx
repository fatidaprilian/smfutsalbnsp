"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelReservation } from "@/actions/reservation";
import { Court, Reservation } from "../types";
import { EditReservationForm } from "./EditReservationForm";

export function ReservationList({
  reservations,
  courts,
  searchQuery,
  selectedDate,
  onPay,
}: {
  reservations: Reservation[];
  courts: Court[];
  searchQuery: string;
  selectedDate: string;
  onPay: (id: string) => void;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/reservations?date=${selectedDate}${search ? `&query=${search}` : ""}`
    );
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Reservasi Saya</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari lapangan..."
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm transition-colors cursor-pointer"
          >
            Cari
          </button>
        </form>
      </div>

      {reservations.length === 0 ? (
        <p className="text-gray-500 text-sm py-4">Belum ada reservasi.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 font-medium text-gray-600">
                  Lapangan
                </th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">
                  Tanggal
                </th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">
                  Waktu
                </th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">
                  Total
                </th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-3 font-medium text-gray-600">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-3">{r.court.name}</td>
                  <td className="py-3 px-3">
                    {new Date(r.date).toLocaleDateString("id-ID")}
                  </td>
                  <td className="py-3 px-3">
                    {String(r.startHour).padStart(2, "0")}:00 –{" "}
                    {String(r.endHour).padStart(2, "0")}:00
                  </td>
                  <td className="py-3 px-3">{formatPrice(r.totalPrice)}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        r.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : r.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : r.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.status === "CONFIRMED"
                        ? "Dikonfirmasi"
                        : r.status === "PENDING"
                        ? "Menunggu Bayar"
                        : r.status === "COMPLETED"
                        ? "Selesai"
                        : "Dibatalkan"}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-2">
                      {r.status === "PENDING" && (
                        <button
                          onClick={() => onPay(r.id)}
                          className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors w-max cursor-pointer shadow-sm"
                        >
                          Bayar QRIS
                        </button>
                      )}
                      {(r.status === "CONFIRMED" || r.status === "PENDING") && (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() =>
                              setEditingId(editingId === r.id ? null : r.id)
                            }
                            className="text-blue-600 hover:bg-blue-50 px-2 py-2 rounded text-sm cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCancel(r.id)}
                            className="text-red-600 hover:bg-red-50 px-2 py-2 rounded text-sm cursor-pointer"
                          >
                            Batalkan
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingId && (
        <EditReservationForm
          reservationId={editingId}
          reservation={reservations.find((r) => r.id === editingId)!}
          courts={courts}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
