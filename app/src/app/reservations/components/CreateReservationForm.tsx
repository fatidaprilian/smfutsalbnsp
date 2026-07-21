"use client";

import { useActionState } from "react";
import { createReservation, type ReservationResult } from "@/actions/reservation";
import { Court } from "../types";

export function CreateReservationForm({
  selectedDate,
  courts,
}: {
  selectedDate: string;
  courts: Court[];
}) {
  const [createState, createAction, isCreating] = useActionState<
    ReservationResult,
    FormData
  >(createReservation, {});

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Buat Reservasi Baru
      </h2>

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

      <form
        action={createAction}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4"
      >
        <input type="hidden" name="date" value={selectedDate} />
        <div>
          <label
            htmlFor="courtId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Lapangan
          </label>
          <select
            id="courtId"
            name="courtId"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label
            htmlFor="startHour"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Jam Mulai
          </label>
          <select
            id="startHour"
            name="startHour"
            required
            onChange={(e) => {
              const form = e.target.form;
              if (form) {
                const endSelect = form.elements.namedItem(
                  "endHour"
                ) as HTMLSelectElement;
                if (endSelect) {
                  const startVal = parseInt(e.target.value);
                  Array.from(endSelect.options).forEach((opt) => {
                    const optVal = parseInt(opt.value);
                    const isPast =
                      selectedDate === new Date().toISOString().split("T")[0] &&
                      optVal <= new Date().getHours();
                    opt.disabled = isPast || optVal <= startVal;
                    if (opt.selected && opt.disabled) {
                      endSelect.value = "";
                    }
                  });
                }
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Jam</option>
            {Array.from({ length: 14 }, (_, i) => i + 8).map((h) => {
              const todayLocal = new Date();
              todayLocal.setMinutes(
                todayLocal.getMinutes() - todayLocal.getTimezoneOffset()
              );
              const isPast =
                selectedDate === todayLocal.toISOString().split("T")[0] &&
                h <= new Date().getHours();
              return (
                <option key={h} value={h} disabled={isPast}>
                  {String(h).padStart(2, "0")}:00
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label
            htmlFor="endHour"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Jam Selesai
          </label>
          <select
            id="endHour"
            name="endHour"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Jam</option>
            {Array.from({ length: 14 }, (_, i) => i + 9).map((h) => {
              const todayLocal = new Date();
              todayLocal.setMinutes(
                todayLocal.getMinutes() - todayLocal.getTimezoneOffset()
              );
              const isPast =
                selectedDate === todayLocal.toISOString().split("T")[0] &&
                h <= new Date().getHours();
              return (
                <option key={h} value={h} disabled={isPast}>
                  {String(h).padStart(2, "0")}:00
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label
            htmlFor="paymentType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tipe Bayar
          </label>
          <select
            id="paymentType"
            name="paymentType"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DP">DP 50%</option>
            <option value="FULL">Lunas 100%</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isCreating ? "Memproses..." : "Reservasi"}
          </button>
        </div>
      </form>
    </div>
  );
}
