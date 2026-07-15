import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { searchReservations, getAvailableSlots } from "@/actions/reservation";
import { prisma } from "@/lib/prisma";
import { CustomerReservationClient } from "./client";
import { getWIBDate } from "@/lib/time";

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; query?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") redirect("/login");

  const params = await searchParams;

  const today = getWIBDate();
  today.setHours(0, 0, 0, 0);
  const selectedDate = params.date || today.toISOString().split("T")[0];

  const [slots, reservations, courts] = await Promise.all([
    getAvailableSlots(selectedDate),
    searchReservations({ query: params.query }),
    prisma.court.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] }),
  ]);

  return (
    <CustomerReservationClient
      slots={slots}
      reservations={JSON.parse(JSON.stringify(reservations))}
      courts={courts}
      selectedDate={selectedDate}
      searchQuery={params.query || ""}
    />
  );
}
