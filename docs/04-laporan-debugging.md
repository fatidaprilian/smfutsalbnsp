# Laporan Debugging
## Sistem Reservasi Lapangan — SM Sport Center

---

## 1. Deskripsi Masalah

**Kasus:** Reservasi tetap tersimpan meskipun jadwal sudah terisi (double booking).

**Cara masalah ini terjadi:** Dua pelanggan membuka halaman reservasi secara bersamaan, memilih lapangan dan jam yang sama, lalu menekan tombol "Reservasi" hampir di waktu yang sama. Kedua reservasi berhasil tersimpan — padahal hanya satu yang seharusnya berhasil.

---

## 2. Pencarian Penyebab Masalah

### 2.1 Analisis Kode Versi Awal

Versi awal menyimpan reservasi menggunakan blok transaksi database tanpa pengaturan tingkat pengamanan secara eksplisit:

```typescript
// VERSI BERMASALAH — pengaturan standar (Read Committed)
await prisma.$transaction(async (tx) => {
  const adaBentrok = await cekBentrok(tx, courtId, tanggal, jamMulai, jamSelesai);
  if (adaBentrok) {
    throw new Error("BENTROK");
  }
  await tx.reservation.create({ data: { ... } });
});
```

### 2.2 Penyebab Utama: Dua Proses Berjalan Bersamaan

Pengaturan standar database PostgreSQL adalah **Read Committed**. Pada pengaturan ini, setiap transaksi hanya bisa melihat data yang sudah selesai disimpan oleh transaksi lain. Akibatnya:

1. **Transaksi A** memeriksa ketersediaan slot → hasilnya: slot kosong, tidak ada bentrok
2. **Transaksi B** memeriksa ketersediaan slot → hasilnya: slot kosong, tidak ada bentrok
   *(Transaksi A belum selesai menyimpan, jadi B tidak tahu ada pemesanan yang sedang berjalan)*
3. **Transaksi A** menyimpan reservasi → berhasil
4. **Transaksi B** menyimpan reservasi → berhasil juga → **DOUBLE BOOKING terjadi**

```
Gambaran urutan waktu:
Transaksi A: |---CEK (kosong)---SIMPAN---SELESAI---|
Transaksi B:    |---CEK (kosong)---SIMPAN---SELESAI---|
                      ↑
                      B tidak melihat pemesanan A karena A belum selesai menyimpan
```

### 2.3 Mengapa Ini Bug Nyata, Bukan Rekayasa

Pola "cek dulu, lalu simpan" dalam satu blok transaksi standar adalah kesalahan umum yang sering terjadi pada sistem pemesanan/reservasi. Masalah ini tidak perlu disimulasikan secara khusus — bisa terjadi secara alami saat dua orang memesan di waktu yang hampir bersamaan.

---

## 3. Perbaikan yang Diterapkan

### 3.1 Gunakan Tingkat Pengamanan Transaksi yang Lebih Ketat

Solusinya adalah menjalankan transaksi dengan pengaturan **Serializable** — database akan memastikan dua proses yang saling berkaitan tidak bisa berjalan bersamaan:

```typescript
// VERSI SETELAH DIPERBAIKI — Serializable
await prisma.$transaction(
  async (tx) => {
    const adaBentrok = await cekBentrok(tx, courtId, tanggal, jamMulai, jamSelesai);
    if (adaBentrok) {
      throw new Error("BENTROK");
    }
    await tx.reservation.create({ data: { ... } });
  },
  { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
);
```

### 3.2 Tambahkan Mekanisme Coba Ulang Otomatis

Ketika dua transaksi bertabrakan, database akan membatalkan salah satunya dan memberikan kode error `P2034`. Agar pengguna tidak langsung melihat error, sistem mencoba ulang secara otomatis hingga 3 kali:

```typescript
async function cobaUlangSerialisasi<T>(
  fn: () => Promise<T>,
  maksimalPercobaan = 3
): Promise<T> {
  for (let percobaan = 0; percobaan < maksimalPercobaan; percobaan++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const adaTabrakan =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";
      if (adaTabrakan && percobaan < maksimalPercobaan - 1) {
        continue; // coba lagi
      }
      throw error;
    }
  }
  throw new Error("Transaksi gagal setelah beberapa percobaan");
}
```

### 3.3 Hasil Setelah Diperbaiki

```
Gambaran urutan waktu setelah perbaikan:
Transaksi A: |---CEK---SIMPAN---SELESAI---|
Transaksi B:    |---CEK---SIMPAN---DIBATALKAN (P2034)---COBA ULANG---CEK (ada data A)---TOLAK---|
                                              ↑
                               Database mendeteksi tabrakan dan membatalkan salah satu
```

Hanya satu transaksi yang berhasil. Transaksi kedua mendapat pesan "Jadwal bentrok!" dan pengguna bisa memilih slot lain.

---

## 4. Verifikasi

### Sebelum Diperbaiki (Pengaturan Standar)
- 2 permintaan bersamaan ke slot yang sama → **keduanya tersimpan** (GAGAL)

### Setelah Diperbaiki (Pengaturan Ketat + Coba Ulang)
- 2 permintaan bersamaan ke slot yang sama → **hanya 1 yang berhasil**, yang lain mendapat error → sistem mencoba ulang → mendeteksi slot sudah terisi → menampilkan pesan "Jadwal bentrok!" (BERHASIL)

---

## 5. Ringkasan Perbaikan

| Item | Keterangan |
|---|---|
| **Bug yang ditemukan** | Double booking akibat dua proses yang berjalan bersamaan |
| **Penyebab** | Pengaturan transaksi standar tidak mencegah dua proses membaca data yang sama sebelum salah satu selesai menyimpan |
| **Perbaikan** | Ganti ke pengaturan transaksi Serializable + tambahkan mekanisme coba ulang otomatis |
| **File yang diubah** | `src/actions/reservation.ts` — fungsi `createReservation` dan `updateReservation` |
| **Dampak** | Tidak ada lagi double booking meskipun dua pengguna memesan di waktu yang sama |
