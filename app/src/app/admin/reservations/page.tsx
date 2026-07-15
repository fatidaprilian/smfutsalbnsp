import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { searchReservations, getAvailableSlots } from "@/actions/reservation";
import { prisma } from "@/lib/prisma";
import { getWIBDate } from "@/lib/time";
import { AdminReservationClient } from "./client";

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    courtId?: string;
    date?: string;
    status?: string;
  }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const params = await searchParams;

  const selectedDate = params.date || getWIBDate().toISOString().split("T")[0];

  const [reservations, courts, slots] = await Promise.all([
    searchReservations({
      query: params.query,
      courtId: params.courtId,
      date: params.date,
      status: params.status,
    }),
    prisma.court.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] }),
    getAvailableSlots(selectedDate),
  ]);

  return (
    <AdminReservationClient
      reservations={JSON.parse(JSON.stringify(reservations))}
      courts={courts}
      slots={slots}
      selectedDate={selectedDate}
      filters={params}
    />
  );
}
