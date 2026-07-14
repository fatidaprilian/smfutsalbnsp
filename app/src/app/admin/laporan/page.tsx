import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LaporanClient } from "./client";

export default async function LaporanPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const courts = await prisma.court.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return <LaporanClient courts={courts} />;
}
