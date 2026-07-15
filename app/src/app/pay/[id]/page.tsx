import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PayClient } from "./client";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      court: true,
      user: { select: { name: true } },
    },
  });

  if (!reservation) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-xl font-bold tracking-wider">SM E-Wallet</h1>
          <p className="text-blue-100 text-sm mt-1">Pembayaran Aman & Instan</p>
        </div>
        <PayClient reservation={JSON.parse(JSON.stringify(reservation))} />
      </div>
    </div>
  );
}
