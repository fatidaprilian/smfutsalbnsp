import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hashSync } from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Courts ---
  const courts = await Promise.all([
    prisma.court.create({
      data: { name: "Futsal A", type: "FUTSAL", pricePerHour: 200000 },
    }),
    prisma.court.create({
      data: { name: "Futsal B", type: "FUTSAL", pricePerHour: 200000 },
    }),
    prisma.court.create({
      data: { name: "Badminton 1", type: "BADMINTON", pricePerHour: 75000 },
    }),
    prisma.court.create({
      data: { name: "Badminton 2", type: "BADMINTON", pricePerHour: 75000 },
    }),
    prisma.court.create({
      data: { name: "Badminton 3", type: "BADMINTON", pricePerHour: 100000 },
    }),
  ]);

  // --- Admin ---
  await prisma.user.create({
    data: {
      name: "Admin SM Sport Center",
      email: "admin@smsportcenter.com",
      passwordHash: hashSync("admin123", 10),
      role: "ADMIN",
    },
  });

  // --- Customers ---
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Budi Santoso",
        email: "budi@email.com",
        passwordHash: hashSync("password123", 10),
        role: "CUSTOMER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Siti Rahayu",
        email: "siti@email.com",
        passwordHash: hashSync("password123", 10),
        role: "CUSTOMER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Andi Wijaya",
        email: "andi@email.com",
        passwordHash: hashSync("password123", 10),
        role: "CUSTOMER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Dewi Lestari",
        email: "dewi@email.com",
        passwordHash: hashSync("password123", 10),
        role: "CUSTOMER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Rudi Hermawan",
        email: "rudi@email.com",
        passwordHash: hashSync("password123", 10),
        role: "CUSTOMER",
      },
    }),
  ]);

  // --- Sample Reservations ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  await Promise.all([
    prisma.reservation.create({
      data: {
        courtId: courts[0].id,
        userId: customers[0].id,
        date: tomorrow,
        startHour: 8,
        endHour: 10,
        totalPrice: 2 * courts[0].pricePerHour,
        status: "CONFIRMED",
      },
    }),
    prisma.reservation.create({
      data: {
        courtId: courts[0].id,
        userId: customers[1].id,
        date: tomorrow,
        startHour: 14,
        endHour: 16,
        totalPrice: 2 * courts[0].pricePerHour,
        status: "CONFIRMED",
      },
    }),
    prisma.reservation.create({
      data: {
        courtId: courts[2].id,
        userId: customers[2].id,
        date: tomorrow,
        startHour: 10,
        endHour: 12,
        totalPrice: 2 * courts[2].pricePerHour,
        status: "CONFIRMED",
      },
    }),
    prisma.reservation.create({
      data: {
        courtId: courts[1].id,
        userId: customers[3].id,
        date: dayAfter,
        startHour: 16,
        endHour: 18,
        totalPrice: 2 * courts[1].pricePerHour,
        status: "CONFIRMED",
      },
    }),
    prisma.reservation.create({
      data: {
        courtId: courts[3].id,
        userId: customers[4].id,
        date: tomorrow,
        startHour: 8,
        endHour: 9,
        totalPrice: 1 * courts[3].pricePerHour,
        status: "CANCELLED",
      },
    }),
  ]);

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
