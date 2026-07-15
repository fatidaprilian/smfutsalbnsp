"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  createReservation,
  updateReservation,
  cancelReservation,
  completeReservation,
  type ReservationResult 
} from "@/actions/reservation";

type Slot = { hour: number; available: boolean };
type CourtSlots = {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
  slots: Slot[];
};
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
  slots,
  selectedDate,
  filters,
}: {
  reservations: Reservation[];
  courts: Court[];
  slots: CourtSlots[];
  selectedDate: string;
  filters: { query?: string; courtId?: string; date?: string; status?: string };
}) {
  const router = useRouter();
  const [query, setQuery] = useState(filters.query || "");
  const [courtId, setCourtId] = useState(filters.courtId || "");
  const [date, setDate] = useState(filters.date || "");
  const [status, setStatus] = useState(filters.status || "");

  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [createState, createAction, isCreating] = useActionState<
    ReservationResult,
    FormData
  >(createReservation, {});

  const handleDateChange = (d: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("date", d);
    setDate(d);
    router.push(`/admin/reservations?${params.toString()}`);
  };

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

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kelola Reservasi</h1>

      {/* Date Selector for Grid */}
      <div className="mb-6">
        <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-1">
          Tanggal Ketersediaan & Form
        </label>
        <input
          id="date-select"
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Availability Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ketersediaan — {new Date(selectedDate + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 px-3 bg-gray-50 rounded-tl-lg font-medium text-gray-600 sticky left-0 z-10">Lapangan</th>
              {Array.from({ length: 14 }, (_, i) => i + 8).map((h) => (
                <th key={h} className="text-center py-2 px-1 bg-gray-50 font-medium text-gray-600 min-w-[3rem]">
                  {String(h).padStart(2, "0")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((court) => (
              <tr key={court.id} className="border-t border-gray-100">
                <td className="py-2 px-3 font-medium text-gray-800 whitespace-nowrap sticky left-0 bg-white z-10">
                  {court.name}
                  <span className="block text-xs text-gray-400">{formatPrice(court.pricePerHour)}/jam</span>
                </td>
                {court.slots.map((slot) => (
                  <td key={slot.hour} className="py-2 px-1 text-center">
                    <div
                      className={`w-8 h-8 rounded mx-auto flex items-center justify-center text-xs font-medium ${
                        slot.available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                      title={slot.available ? "Tersedia" : "Terisi"}
                    >
                      {slot.available ? "✓" : "✗"}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded inline-block"></span> Tersedia</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded inline-block"></span> Terisi</span>
        </div>
      </div>

      {/* Create Reservation Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 border-l-4 border-l-blue-600">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Buat Reservasi (Walk-in)</h2>
        <p className="text-sm text-gray-500 mb-4">Reservasi ini akan dibuat atas nama Admin (Offline Booking).</p>

        {createState.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {createState.error}
          </div>
        )}
        {createState.success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Reservasi walk-in berhasil dibuat!
          </div>
        )}

        <form action={createAction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <input type="hidden" name="date" value={selectedDate} />
          <div>
            <label htmlFor="courtId" className="block text-sm font-medium text-gray-700 mb-1">Lapangan</label>
            <select
              id="courtId"
              name="courtId"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Pilih lapangan</option>
              {courts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({formatPrice(c.pricePerHour)}/jam)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="startHour" className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
            <select
              id="startHour"
              name="startHour"
              required
              onChange={(e) => {
                const form = e.target.form;
                if (form) {
                  const endSelect = form.elements.namedItem("endHour") as HTMLSelectElement;
                  if (endSelect) {
                    const startVal = parseInt(e.target.value);
                    Array.from(endSelect.options).forEach(opt => {
                      const optVal = parseInt(opt.value);
                      opt.disabled = optVal <= startVal;
                      if (opt.selected && opt.disabled) {
                        endSelect.value = "";
                      }
                    });
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Pilih Jam</option>
              {Array.from({ length: 14 }, (_, i) => i + 8).map((h) => (
                <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="endHour" className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
            <select
              id="endHour"
              name="endHour"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Pilih Jam</option>
              {Array.from({ length: 14 }, (_, i) => i + 9).map((h) => (
                <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1">Tipe Bayar</label>
            <select
              id="paymentType"
              name="paymentType"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="FULL">Lunas 100% (Kasir)</option>
              <option value="DP">DP 50% (Kasir)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm"
            >
              {isCreating ? "Memproses..." : "Buat Reservasi"}
            </button>
          </div>
        </form>
      </div>

      {/* Filters for Table */}
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
              className="flex-1 py-2 px-4 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors cursor-pointer"
            >
              Filter Data
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daftar Reservasi</h2>
        {reservations.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">Tidak ada reservasi ditemukan.</p>
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
                            className="text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-[10px] font-medium transition-colors w-max shadow-sm cursor-pointer"
                          >
                            Pelunasan
                          </button>
                        )}
                        {(r.status === "CONFIRMED" || r.status === "PENDING") && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingId(editingId === r.id ? null : r.id)}
                              className="text-blue-600 hover:underline text-xs cursor-pointer text-left w-max"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleCancel(r.id)}
                              className="text-red-600 hover:underline text-xs cursor-pointer text-left w-max"
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
        
        {/* Edit Form (inline) */}
        {editingId && (
          <EditReservationForm
            reservationId={editingId}
            reservation={reservations.find((r) => r.id === editingId)!}
            courts={courts}
            onClose={() => setEditingId(null)}
          />
        )}

      </div>
      <p className="text-xs text-gray-400 mt-2">
        Menampilkan {reservations.length} reservasi
      </p>
    </div>
  );
}

function EditReservationForm({
  reservationId,
  reservation,
  courts,
  onClose,
}: {
  reservationId: string;
  reservation: Reservation;
  courts: Court[];
  onClose: () => void;
}) {
  const router = useRouter();
  const boundUpdate = updateReservation.bind(null, reservationId);
  const [state, formAction, isPending] = useActionState<
    ReservationResult,
    FormData
  >(boundUpdate, {});

  if (state.success) {
    router.refresh();
    onClose();
  }

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Edit Reservasi (Admin) — {reservation.court.name} - {reservation.user.name}</h3>
      {state.error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {state.error}
        </div>
      )}
      <form action={formAction} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label htmlFor={`edit-court-${reservationId}`} className="block text-xs font-medium text-gray-600 mb-1">Ganti Lapangan</label>
          <select
            id={`edit-court-${reservationId}`}
            name="courtId"
            defaultValue={reservation.courtId}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {courts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`edit-date-${reservationId}`} className="block text-xs font-medium text-gray-600 mb-1">Ganti Tanggal</label>
          <input
            id={`edit-date-${reservationId}`}
            name="date"
            type="date"
            defaultValue={new Date(reservation.date).toISOString().split("T")[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor={`edit-start-${reservationId}`} className="block text-xs font-medium text-gray-600 mb-1">Jam Mulai</label>
          <select
            id={`edit-start-${reservationId}`}
            name="startHour"
            defaultValue={reservation.startHour}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 14 }, (_, i) => i + 8).map((h) => (
              <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`edit-end-${reservationId}`} className="block text-xs font-medium text-gray-600 mb-1">Jam Selesai</label>
          <select
            id={`edit-end-${reservationId}`}
            name="endHour"
            defaultValue={reservation.endHour}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 14 }, (_, i) => i + 9).map((h) => (
              <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2 sm:col-span-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="py-2 px-4 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
