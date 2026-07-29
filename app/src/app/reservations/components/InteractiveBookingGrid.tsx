"use client";

import { useState, useActionState } from "react";
import { createReservation, type ReservationResult } from "@/actions/reservation";
import { CourtSlots } from "../types";

export function InteractiveBookingGrid({
  slots,
  selectedDate,
}: {
  slots: CourtSlots[];
  selectedDate: string;
}) {
  const [createState, createAction, isCreating] = useActionState<
    ReservationResult,
    FormData
  >(createReservation, {});

  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null);
  const [selectedEndHour, setSelectedEndHour] = useState<number | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const handleSlotClick = (courtId: string, hour: number, available: boolean) => {
    if (!available) return;

    // Reset selection if clicking a different court
    if (selectedCourtId !== courtId) {
      setSelectedCourtId(courtId);
      setSelectedStartHour(hour);
      setSelectedEndHour(hour + 1);
      return;
    }

    if (selectedStartHour !== null && selectedEndHour !== null) {
      // If clicking inside the current selection, clear selection
      if (hour >= selectedStartHour && hour < selectedEndHour) {
        setSelectedCourtId(null);
        setSelectedStartHour(null);
        setSelectedEndHour(null);
        return;
      }

      // If clicking outside, try to extend the range
      const newStart = Math.min(selectedStartHour, hour);
      const newEnd = Math.max(selectedEndHour, hour + 1);
      
      // Verify all slots in the new range are available
      const court = slots.find(c => c.id === courtId);
      if (court) {
        let allAvailable = true;
        for (let h = newStart; h < newEnd; h++) {
          const s = court.slots.find(slot => slot.hour === h);
          if (!s || !s.available) {
            allAvailable = false;
            break;
          }
        }

        if (allAvailable) {
          setSelectedStartHour(newStart);
          setSelectedEndHour(newEnd);
        } else {
          // If not contiguous, just start a new selection from this slot
          setSelectedStartHour(hour);
          setSelectedEndHour(hour + 1);
        }
      }
    } else {
      setSelectedCourtId(courtId);
      setSelectedStartHour(hour);
      setSelectedEndHour(hour + 1);
    }
  };

  const selectedCourt = selectedCourtId ? slots.find(c => c.id === selectedCourtId) : null;
  const totalPrice = selectedCourt && selectedStartHour !== null && selectedEndHour !== null
    ? selectedCourt.pricePerHour * (selectedEndHour - selectedStartHour)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <span>
          Ketersediaan —{" "}
          {new Date(selectedDate + "T00:00:00").toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <span className="text-sm font-normal text-gray-500">
          *Klik kotak hijau untuk memilih jadwal
        </span>
      </h2>

      <div className="overflow-x-auto mb-6 pb-2">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 px-3 bg-gray-50 rounded-tl-lg font-medium text-gray-600 sticky left-0 z-10">
                Lapangan
              </th>
              {Array.from({ length: 14 }, (_, i) => i + 8).map((h) => (
                <th
                  key={h}
                  className="text-center py-2 px-1 bg-gray-50 font-medium text-gray-600 min-w-[3rem]"
                >
                  {String(h).padStart(2, "0")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((court) => (
              <tr key={court.id} className="border-t border-gray-100">
                <td className="py-2 px-3 font-medium text-gray-800 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-50">
                  {court.name}
                  <span className="block text-sm text-gray-400">
                    {formatPrice(court.pricePerHour)}/jam
                  </span>
                </td>
                {court.slots.map((slot) => {
                  const isSelected = selectedCourtId === court.id && selectedStartHour !== null && selectedEndHour !== null && slot.hour >= selectedStartHour && slot.hour < selectedEndHour;
                  
                  return (
                    <td key={slot.hour} className="py-2 px-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleSlotClick(court.id, slot.hour, slot.available)}
                        disabled={!slot.available}
                        className={`w-10 h-10 rounded mx-auto flex items-center justify-center text-sm font-medium transition-all transform active:scale-95 ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300 ring-offset-1"
                            : slot.available
                            ? "bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-sm cursor-pointer"
                            : "bg-red-50 text-red-300 cursor-not-allowed"
                        }`}
                        title={isSelected ? "Terpilih" : slot.available ? "Tersedia" : "Terisi"}
                      >
                        {isSelected ? "✓" : slot.available ? "" : "✗"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="flex gap-4 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 bg-green-100 rounded inline-block"></span> Tersedia
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 bg-blue-600 rounded inline-block"></span> Dipilih
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 bg-red-50 rounded inline-block text-red-300 flex items-center justify-center text-xs">✗</span> Terisi
          </span>
        </div>
      </div>

      {createState.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {createState.error}
        </div>
      )}
      {createState.success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Reservasi berhasil dibuat!
        </div>
      )}

      {/* Form Pemesanan akan muncul jika user sudah memilih slot */}
      {selectedCourtId && selectedStartHour !== null && selectedEndHour !== null && selectedCourt && (
        <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-blue-100 pb-2">
            Ringkasan Pemesanan
          </h3>
          
          <form action={createAction} noValidate>
            <input type="hidden" name="date" value={selectedDate} />
            <input type="hidden" name="courtId" value={selectedCourtId} />
            <input type="hidden" name="startHour" value={String(selectedStartHour)} />
            <input type="hidden" name="endHour" value={String(selectedEndHour)} />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <span className="block text-sm text-gray-500 mb-1">Lapangan</span>
                <span className="font-semibold text-gray-900">{selectedCourt.name}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500 mb-1">Waktu</span>
                <span className="font-semibold text-blue-700">
                  {String(selectedStartHour).padStart(2, "0")}:00 - {String(selectedEndHour).padStart(2, "0")}:00
                </span>
                <span className="text-xs text-gray-500 block">
                  ({selectedEndHour - selectedStartHour} jam)
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-500 mb-1">Total Biaya</span>
                <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
              </div>
              <div>
                <label htmlFor="paymentType" className="block text-sm text-gray-500 mb-1">
                  Tipe Pembayaran
                </label>
                <select
                  id="paymentType"
                  name="paymentType"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="DP">DP 50%</option>
                  <option value="FULL">Lunas 100%</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedCourtId(null);
                  setSelectedStartHour(null);
                  setSelectedEndHour(null);
                }}
                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
              >
                {isCreating ? "Memproses..." : "Pesan Sekarang"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
