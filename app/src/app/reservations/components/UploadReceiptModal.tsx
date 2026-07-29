"use client";

import { useState } from "react";
import { uploadPaymentReceipt } from "@/actions/reservation";
import { Reservation } from "../types";

export function UploadReceiptModal({
  uploadModalId,
  reservations,
  onClose,
}: {
  uploadModalId: string | null;
  reservations: Reservation[];
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!uploadModalId) return null;

  const reservation = reservations.find((r) => r.id === uploadModalId);
  if (!reservation) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Pilih file terlebih dahulu");
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("receipt", file);

    const res = await uploadPaymentReceipt(uploadModalId, formData);
    setIsUploading(false);

    if (res.success) {
      alert("Bukti pembayaran berhasil diunggah!");
      onClose();
    } else {
      alert(res.error || "Terjadi kesalahan saat mengunggah");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Upload Bukti Pembayaran</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleUpload} className="p-6 flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Silakan unggah foto struk / screenshot bukti transfer pembayaran untuk reservasi lapangan <b>{reservation.court.name}</b>.
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 cursor-pointer"
            required
          />

          <button
            type="submit"
            disabled={isUploading || !file}
            className="mt-2 w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isUploading ? "Mengunggah..." : "Unggah Bukti"}
          </button>
        </form>
      </div>
    </div>
  );
}
