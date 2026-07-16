"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { reservationSchema, searchReservationSchema } from "@/lib/validations";
import { getWIBDate } from "@/lib/time";
import { Prisma } from "@/generated/prisma";

export type ReservationResult = {
  error?: string;
  success?: boolean;
};

// --- Conflict Check (used inside transactions) ---
async function checkConflict(
  tx: Prisma.TransactionClient,
  courtId: string,
  date: Date,
  startHour: number,
  endHour: number,
  excludeId?: string
): Promise<boolean> {
  const conflicts = await tx.reservation.findMany({
    where: {
      courtId,
      date,
      OR: [
        { status: { in: ["CONFIRMED", "PENDING", "COMPLETED"] } },
        { status: "CANCELLED", paymentType: "FULL" },
      ],
      startHour: { lt: endHour },
      endHour: { gt: startHour },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
  return conflicts.length > 0;
}

// --- Retry wrapper for Serializable transactions ---
async function withSerializableRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isPrismaConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";
      if (isPrismaConflict && attempt < maxRetries - 1) {
        continue;
      }
      throw error;
    }
  }
  throw new Error("Transaksi gagal setelah beberapa percobaan");
}

// --- Get Available Slots ---
export async function getAvailableSlots(dateStr: string) {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  const courts = await prisma.court.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  const reservations = await prisma.reservation.findMany({
    where: {
      date,
      OR: [
        { status: { in: ["CONFIRMED", "PENDING", "COMPLETED"] } },
        { status: "CANCELLED", paymentType: "FULL" },
      ],
    },
    select: {
      courtId: true,
      startHour: true,
      endHour: true,
    },
  });

  return courts.map((court) => {
    const courtReservations = reservations.filter(
      (r) => r.courtId === court.id
    );

    const now = getWIBDate();
    const isToday = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();

    const slots: { hour: number; available: boolean }[] = [];
    for (let h = 8; h < 22; h++) {
      const isBooked = courtReservations.some(
        (r) => r.startHour <= h && r.endHour > h
      );
      const isPast = isToday && h <= now.getHours();
      slots.push({ hour: h, available: !isBooked && !isPast });
    }

    return {
      id: court.id,
      name: court.name,
      type: court.type,
      pricePerHour: court.pricePerHour,
      slots,
    };
  });
}

// --- Create Reservation ---
export async function createReservation(
  _prevState: ReservationResult,
  formData: FormData
): Promise<ReservationResult> {
  const session = await getSession();
  if (!session) {
    return { error: "Anda harus login terlebih dahulu" };
  }

  const raw = {
    courtId: formData.get("courtId"),
    date: formData.get("date"),
    startHour: formData.get("startHour"),
    endHour: formData.get("endHour"),
    paymentType: formData.get("paymentType") || "DP",
  };

  const parsed = reservationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { courtId, date, startHour, endHour, paymentType } = parsed.data;
  const reservationDate = new Date(date);
  reservationDate.setHours(0, 0, 0, 0);

  // Mencegah CUSTOMER memesan jam yang sudah lewat di hari yang sama
  if (session.role === "CUSTOMER") {
    const now = getWIBDate();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (reservationDate.getTime() < today.getTime()) {
      return { error: "Tidak bisa memesan untuk tanggal yang sudah lewat." };
    }
    if (reservationDate.getTime() === today.getTime() && startHour <= now.getHours()) {
      return { error: "Waktu tersebut sudah terlewat. Silakan pilih jam lain." };
    }
  }

  try {
    await withSerializableRetry(() =>
      prisma.$transaction(
        async (tx) => {
          const hasConflict = await checkConflict(
            tx,
            courtId,
            reservationDate,
            startHour,
            endHour
          );
          if (hasConflict) {
            throw new Error("CONFLICT");
          }

          const court = await tx.court.findUniqueOrThrow({
            where: { id: courtId },
          });

          await tx.reservation.create({
            data: {
              courtId,
              userId: session.userId,
              date: reservationDate,
              startHour,
              endHour,
              totalPrice: (endHour - startHour) * court.pricePerHour,
              paymentType,
              status: "PENDING",
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      )
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "CONFLICT") {
      return { error: "Jadwal bentrok! Slot waktu tersebut sudah terisi." };
    }
    return { error: "Gagal membuat reservasi. Silakan coba lagi." };
  }

  revalidatePath("/reservations");
  return { success: true };
}

// --- Update Reservation ---
export async function updateReservation(
  reservationId: string,
  _prevState: ReservationResult,
  formData: FormData
): Promise<ReservationResult> {
  const session = await getSession();
  if (!session) {
    return { error: "Anda harus login terlebih dahulu" };
  }

  // Ownership check
  const existing = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!existing) {
    return { error: "Reservasi tidak ditemukan" };
  }
  if (session.role === "CUSTOMER" && existing.userId !== session.userId) {
    return { error: "Anda tidak memiliki akses ke reservasi ini" };
  }

  const raw = {
    courtId: formData.get("courtId") || existing.courtId,
    date: formData.get("date"),
    startHour: formData.get("startHour"),
    endHour: formData.get("endHour"),
  };

  const parsed = reservationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { courtId, date, startHour, endHour } = parsed.data;
  const reservationDate = new Date(date);
  reservationDate.setHours(0, 0, 0, 0);

  // Mencegah CUSTOMER mengubah ke jam yang sudah lewat di hari yang sama
  if (session.role === "CUSTOMER") {
    const now = getWIBDate();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (reservationDate.getTime() < today.getTime()) {
      return { error: "Tidak bisa mengubah ke tanggal yang sudah lewat." };
    }
    if (reservationDate.getTime() === today.getTime() && startHour <= now.getHours()) {
      return { error: "Waktu tersebut sudah terlewat. Silakan pilih jam lain." };
    }
  }

  try {
    await withSerializableRetry(() =>
      prisma.$transaction(
        async (tx) => {
          const hasConflict = await checkConflict(
            tx,
            courtId,
            reservationDate,
            startHour,
            endHour,
            reservationId
          );
          if (hasConflict) {
            throw new Error("CONFLICT");
          }

          const court = await tx.court.findUniqueOrThrow({
            where: { id: courtId },
          });

          await tx.reservation.update({
            where: { id: reservationId },
            data: {
              courtId,
              date: reservationDate,
              startHour,
              endHour,
              totalPrice: (endHour - startHour) * court.pricePerHour,
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      )
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "CONFLICT") {
      return { error: "Jadwal bentrok! Slot waktu tersebut sudah terisi." };
    }
    return { error: "Gagal mengubah reservasi. Silakan coba lagi." };
  }

  revalidatePath("/reservations");
  revalidatePath("/admin/reservations");
  return { success: true };
}

// --- Cancel Reservation ---
export async function cancelReservation(
  reservationId: string
): Promise<ReservationResult> {
  const session = await getSession();
  if (!session) {
    return { error: "Anda harus login terlebih dahulu" };
  }

  const existing = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!existing) {
    return { error: "Reservasi tidak ditemukan" };
  }

  // Customer can only cancel their own
  if (session.role === "CUSTOMER" && existing.userId !== session.userId) {
    return { error: "Anda tidak memiliki akses ke reservasi ini" };
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/reservations");
  revalidatePath("/admin/reservations");
  return { success: true };
}

// --- Search Reservations ---
export async function searchReservations(params: {
  query?: string;
  courtId?: string;
  date?: string;
  status?: string;
}) {
  const session = await getSession();
  if (!session) return [];

  const parsed = searchReservationSchema.safeParse(params);
  if (!parsed.success) return [];

  const { query, courtId, date, status } = parsed.data;

  const where: Prisma.ReservationWhereInput = {};

  // Customer can only see their own
  if (session.role === "CUSTOMER") {
    where.userId = session.userId;
  }

  if (courtId) {
    where.courtId = courtId;
  }

  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    where.date = d;
  }

  if (status) {
    where.status = status as "CONFIRMED" | "CANCELLED";
  }

  if (query) {
    where.OR = [
      { court: { name: { contains: query, mode: "insensitive" } } },
      { user: { name: { contains: query, mode: "insensitive" } } },
      { user: { email: { contains: query, mode: "insensitive" } } },
    ];
  }

  return prisma.reservation.findMany({
    where,
    include: {
      court: { select: { name: true, type: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: [{ date: "desc" }, { startHour: "asc" }],
    take: 100,
  });
}

// --- Process Wallet Payment (Simulator) ---
export async function processWalletPayment(reservationId: string): Promise<ReservationResult> {
  const existing = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!existing) {
    return { error: "Reservasi tidak ditemukan" };
  }
  if (existing.status !== "PENDING") {
    return { error: "Status reservasi bukan PENDING" };
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CONFIRMED" },
  });

  revalidatePath("/reservations");
  revalidatePath("/admin/reservations");
  revalidatePath(`/pay/${reservationId}`);
  return { success: true };
}

// --- Check Reservation Status (Polling) ---
export async function checkReservationStatus(reservationId: string) {
  const existing = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: { status: true },
  });
  return existing?.status;
}

// --- Complete Reservation (Admin) ---
export async function completeReservation(reservationId: string): Promise<ReservationResult> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Hanya Admin yang dapat melakukan pelunasan" };
  }

  const existing = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!existing) {
    return { error: "Reservasi tidak ditemukan" };
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "COMPLETED" },
  });

  revalidatePath("/reservations");
  revalidatePath("/admin/reservations");
  return { success: true };
}
