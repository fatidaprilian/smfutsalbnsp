export const RESERVATION_STATUS = {
  CONFIRMED: { label: "Dikonfirmasi", color: "bg-green-100 text-green-700" },
  PENDING: { label: "Menunggu Bayar", color: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "Selesai", color: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "Dibatalkan", color: "bg-gray-100 text-gray-500" },
} as const;

export type ReservationStatusType = keyof typeof RESERVATION_STATUS;
