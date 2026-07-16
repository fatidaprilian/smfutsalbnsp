"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { laporanSchema } from "@/lib/validations";
import { Prisma } from "@/generated/prisma";

export type LaporanResult = {
  totalJam: number;
  totalPendapatan: number;
  perLapangan: {
    courtName: string;
    courtType: string;
    totalJam: number;
    totalPendapatan: number;
    jumlahReservasi: number;
  }[];
};

export async function getLaporanPenggunaan(params: {
  startDate: string;
  endDate: string;
  courtId?: string;
}): Promise<{ error?: string; data?: LaporanResult }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Akses ditolak" };
  }

  const parsed = laporanSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { startDate, endDate, courtId } = parsed.data;

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const dateFilter = {
    gte: start,
    lte: end,
  };

  const where: Prisma.ReservationWhereInput = {
    date: dateFilter,
    OR: [
      { status: { in: ["CONFIRMED", "COMPLETED"] } },
      { status: "CANCELLED", paymentType: "DP" },
    ],
  };

  if (courtId) {
    where.courtId = courtId;
  }

  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      court: { select: { name: true, type: true } },
    },
  });

  // Aggregate per court
  const courtMap = new Map<
    string,
    {
      courtName: string;
      courtType: string;
      totalJam: number;
      totalPendapatan: number;
      jumlahReservasi: number;
    }
  >();

  for (const r of reservations) {
    const key = r.courtId;
    const existing = courtMap.get(key) || {
      courtName: r.court.name,
      courtType: r.court.type,
      totalJam: 0,
      totalPendapatan: 0,
      jumlahReservasi: 0,
    };

    if (r.status === "CANCELLED") {
      existing.totalPendapatan += Math.floor(r.totalPrice / 2);
    } else {
      existing.totalJam += r.endHour - r.startHour;
      existing.totalPendapatan += r.totalPrice;
      existing.jumlahReservasi += 1;
    }

    courtMap.set(key, existing);
  }

  const perLapangan = Array.from(courtMap.values()).sort((a, b) =>
    a.courtName.localeCompare(b.courtName)
  );

  const totalJam = perLapangan.reduce((sum, c) => sum + c.totalJam, 0);
  const totalPendapatan = perLapangan.reduce(
    (sum, c) => sum + c.totalPendapatan,
    0
  );

  return {
    data: { totalJam, totalPendapatan, perLapangan },
  };
}
