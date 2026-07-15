"use client";

import { useState } from "react";
import { getLaporanPenggunaan, type LaporanResult } from "@/actions/laporan";

type Court = { id: string; name: string; type: string; pricePerHour: number };

export function LaporanClient({ courts }: { courts: Court[] }) {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(firstOfMonth.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);
  const [courtId, setCourtId] = useState("");
  const [data, setData] = useState<LaporanResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);

    const result = await getLaporanPenggunaan({
      startDate,
      endDate,
      courtId: courtId || undefined,
    });

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setData(result.data);
    }
    setLoading(false);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 print:text-center print:text-3xl print:mb-8">Laporan Penggunaan Lapangan</h1>
      <div className="hidden print:block mb-6 text-center text-gray-600">
        <p>Periode: {new Date(startDate).toLocaleDateString("id-ID")} - {new Date(endDate).toLocaleDateString("id-ID")}</p>
        <p>Dicetak pada: {new Date().toLocaleString("id-ID")}</p>
      </div>

      {/* Filter Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 print:hidden">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Selesai
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="courtFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Lapangan
            </label>
            <select
              id="courtFilter"
              value={courtId}
              onChange={(e) => setCourtId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Lapangan</option>
              {courts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? "Memuat..." : "Tampilkan Laporan"}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Report Results */}
      {data && (
        <>
          {/* Summary Cards */}
          <div className="flex justify-between items-center mb-4 print:hidden">
            <h2 className="text-xl font-bold text-gray-800">Ringkasan Laporan</h2>
            <button
              onClick={() => window.print()}
              className="py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex gap-2 items-center cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
                <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
              </svg>
              Cetak / Simpan PDF
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Total Jam Terpakai</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalJam} jam</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
              <p className="text-3xl font-bold text-green-600">{formatPrice(data.totalPendapatan)}</p>
            </div>
          </div>

          {/* Per Court Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Detail Per Lapangan</h2>
            </div>
            {data.perLapangan.length === 0 ? (
              <p className="text-gray-500 text-sm p-6">Tidak ada data untuk periode ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Lapangan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Tipe</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Jumlah Reservasi</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Total Jam</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Total Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.perLapangan.map((item) => (
                      <tr key={item.courtName} className="border-t border-gray-100">
                        <td className="py-3 px-4 font-medium">{item.courtName}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.courtType === "FUTSAL"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}>
                            {item.courtType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{item.jumlahReservasi}</td>
                        <td className="py-3 px-4 text-right">{item.totalJam} jam</td>
                        <td className="py-3 px-4 text-right font-medium">{formatPrice(item.totalPendapatan)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                      <td className="py-3 px-4" colSpan={2}>Total</td>
                      <td className="py-3 px-4 text-right">
                        {data.perLapangan.reduce((s, c) => s + c.jumlahReservasi, 0)}
                      </td>
                      <td className="py-3 px-4 text-right">{data.totalJam} jam</td>
                      <td className="py-3 px-4 text-right">{formatPrice(data.totalPendapatan)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
