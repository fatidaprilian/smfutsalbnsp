import { CourtSlots } from "../types";

export function AvailabilityGrid({
  slots,
  selectedDate,
}: {
  slots: CourtSlots[];
  selectedDate: string;
}) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 overflow-x-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Ketersediaan —{" "}
        {new Date(selectedDate + "T00:00:00").toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </h2>
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
              <td className="py-2 px-3 font-medium text-gray-800 whitespace-nowrap sticky left-0 bg-white z-10">
                {court.name}
                <span className="block text-sm text-gray-400">
                  {formatPrice(court.pricePerHour)}/jam
                </span>
              </td>
              {court.slots.map((slot) => (
                <td key={slot.hour} className="py-2 px-1 text-center">
                  <div
                    className={`w-10 h-10 rounded mx-auto flex items-center justify-center text-sm font-medium ${
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
      <div className="flex gap-4 mt-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-100 rounded inline-block"></span>{" "}
          Tersedia
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-100 rounded inline-block"></span>{" "}
          Terisi
        </span>
      </div>
    </div>
  );
}
