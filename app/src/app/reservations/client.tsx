"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CourtSlots, Court, Reservation } from "./types";
import { AvailabilityGrid } from "./components/AvailabilityGrid";
import { CreateReservationForm } from "./components/CreateReservationForm";
import { ReservationList } from "./components/ReservationList";
import { PaymentModal } from "./components/PaymentModal";

export function CustomerReservationClient({
  slots,
  reservations,
  courts,
  selectedDate,
  searchQuery,
}: {
  slots: CourtSlots[];
  reservations: Reservation[];
  courts: Court[];
  selectedDate: string;
  searchQuery: string;
}) {
  const router = useRouter();
  const [payModalId, setPayModalId] = useState<string | null>(null);

  const handleDateChange = (date: string) => {
    router.push(
      `/reservations?date=${date}${
        searchQuery ? `&query=${searchQuery}` : ""
      }`
    );
  };

  // Auto-refresh data secara berkala (Real-time updates)
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000); // Tiap 10 detik
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Reservasi Lapangan
      </h1>

      {/* Date Selector */}
      <div className="mb-6">
        <label
          htmlFor="date-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Pilih Tanggal
        </label>
        <input
          id="date-select"
          type="date"
          value={selectedDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => handleDateChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <AvailabilityGrid slots={slots} selectedDate={selectedDate} />

      <CreateReservationForm selectedDate={selectedDate} courts={courts} />

      <ReservationList
        reservations={reservations}
        courts={courts}
        searchQuery={searchQuery}
        selectedDate={selectedDate}
        onPay={(id) => setPayModalId(id)}
      />

      <PaymentModal
        payModalId={payModalId}
        reservations={reservations}
        onClose={() => setPayModalId(null)}
      />
    </div>
  );
}
