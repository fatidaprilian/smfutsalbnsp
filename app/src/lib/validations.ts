import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100, "Nama terlalu panjang"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter").max(128, "Password terlalu panjang"),
});

export const reservationSchema = z.object({
  courtId: z.string().min(1, "Pilih lapangan"),
  date: z.string().refine((val) => {
    const d = new Date(val);
    return !isNaN(d.getTime());
  }, "Tanggal tidak valid"),
  startHour: z.coerce
    .number()
    .int()
    .min(8, "Jam mulai minimal 08:00")
    .max(21, "Jam mulai maksimal 21:00"),
  endHour: z.coerce
    .number()
    .int()
    .min(9, "Jam selesai minimal 09:00")
    .max(22, "Jam selesai maksimal 22:00"),
  paymentType: z.enum(["DP", "FULL"]).default("DP"),
}).refine((data) => data.endHour > data.startHour, {
  message: "Jam selesai harus lebih besar dari jam mulai",
  path: ["endHour"],
});

export const searchReservationSchema = z.object({
  query: z.string().optional(),
  courtId: z.string().optional(),
  date: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
});

export const laporanSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(new Date(val).getTime()), "Tanggal mulai tidak valid"),
  endDate: z.string().refine((val) => !isNaN(new Date(val).getTime()), "Tanggal selesai tidak valid"),
  courtId: z.string().optional(),
});
