"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateReservation, type ReservationResult } from "@/actions/reservation";
import { Court, Reservation } from "../types";

export function EditReservationForm({
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
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Edit Reservasi — {reservation.court.name}
      </h3>
      {state.error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {state.error}
        </div>
      )}
      <form
        action={formAction}
        className="grid grid-cols-1 sm:grid-cols-4 gap-3"
      >
        <input type="hidden" name="courtId" value={reservation.courtId} />
        <div>
          <label
            htmlFor={`edit-date-${reservationId}`}
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Tanggal
          </label>
          <input
            id={`edit-date-${reservationId}`}
            name="date"
            type="date"
            defaultValue={
              new Date(reservation.date).toISOString().split("T")[0]
            }
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor={`edit-start-${reservationId}`}
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Jam Mulai
          </label>
          <select
            id={`edit-start-${reservationId}`}
            name="startHour"
            defaultValue={reservation.startHour}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 14 }, (_, i) => i + 8).map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor={`edit-end-${reservationId}`}
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Jam Selesai
          </label>
          <select
            id={`edit-end-${reservationId}`}
            name="endHour"
            defaultValue={reservation.endHour}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 14 }, (_, i) => i + 9).map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-2 px-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isPending ? "..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-3 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
