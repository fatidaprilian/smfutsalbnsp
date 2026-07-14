# Laporan Debugging
## Sistem Reservasi Lapangan — SM Sport Center

---

## 1. Deskripsi Masalah

**Kasus:** Reservasi tetap tersimpan meskipun jadwal sudah terisi (double booking).

**Skenario reproduksi:** Dua pengguna membuka halaman reservasi bersamaan, memilih lapangan dan slot waktu yang sama, lalu menekan tombol "Reservasi" hampir bersamaan. Kedua reservasi berhasil tersimpan — padahal seharusnya hanya satu yang boleh berhasil.

## 2. Investigasi Root Cause

### 2.1 Analisis Kode Versi Awal

Versi awal menggunakan `$transaction` tanpa isolation level eksplisit:

```typescript
// VERSI BUGGY — default Read Committed
await prisma.$transaction(async (tx) => {
  const hasConflict = await checkConflict(tx, courtId, date, startHour, endHour);
  if (hasConflict) {
    throw new Error("CONFLICT");
  }
  await tx.reservation.create({ data: { ... } });
});
```

### 2.2 Root Cause: Race Condition pada Read Committed

PostgreSQL default isolation level adalah **Read Committed**. Pada level ini:

1. **Transaksi A** menjalankan `checkConflict` → hasilnya: tidak ada konflik (slot kosong)
2. **Transaksi B** menjalankan `checkConflict` → hasilnya: tidak ada konflik (slot kosong)
   *(Transaksi A belum commit, jadi B tidak melihat data yang diinsert A)*
3. **Transaksi A** melakukan `INSERT` → berhasil
4. **Transaksi B** melakukan `INSERT` → berhasil juga → **DOUBLE BOOKING**

```
Timeline:
Transaksi A: |---SELECT (kosong)---INSERT---COMMIT---|
Transaksi B:    |---SELECT (kosong)---INSERT---COMMIT---|
                      ↑
                      B tidak melihat insert A karena A belum commit
```

### 2.3 Mengapa Ini Bug Nyata (Bukan Direkayasa)

Pattern `SELECT → check → INSERT` di dalam Read Committed transaction adalah bug klasik yang dikenal sebagai **write skew anomaly**. Ini terjadi secara natural di aplikasi booking/reservasi — bukan edge case yang perlu direkayasa.

## 3. Solusi yang Diterapkan

### 3.1 Naikkan Isolation Level ke Serializable

```typescript
// VERSI FIX — Serializable isolation
await prisma.$transaction(
  async (tx) => {
    const hasConflict = await checkConflict(tx, courtId, date, startHour, endHour);
    if (hasConflict) {
      throw new Error("CONFLICT");
    }
    await tx.reservation.create({ data: { ... } });
  },
  { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
);
```

### 3.2 Tambah Retry Logic untuk Error P2034

Pada Serializable, PostgreSQL mendeteksi konflik dan meng-abort salah satu transaksi dengan error code `P2034` (Prisma) / `40001` (PostgreSQL). Aplikasi harus retry:

```typescript
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
        continue; // retry
      }
      throw error;
    }
  }
  throw new Error("Transaksi gagal setelah beberapa percobaan");
}
```

### 3.3 Hasil Setelah Fix

```
Timeline setelah fix:
Transaksi A: |---SELECT---INSERT---COMMIT---|
Transaksi B:    |---SELECT---INSERT---ABORT (P2034)---RETRY---SELECT (ada data A)---REJECT---|
                                                 ↑
                                    PostgreSQL mendeteksi serialization failure
```

Hanya satu transaksi yang berhasil. Yang kedua mendapat pesan error "Jadwal bentrok!" dan bisa mencoba slot lain.

## 4. Verifikasi

### Sebelum Fix (Read Committed)
- 2 request paralel ke slot yang sama → **keduanya tersimpan** (GAGAL)

### Setelah Fix (Serializable + Retry)
- 2 request paralel ke slot yang sama → **hanya 1 yang berhasil**, yang lain mendapat error → di-retry → mendeteksi konflik → menampilkan pesan "Jadwal bentrok!" (BERHASIL)

## 5. Kesimpulan

| Item | Detail |
|---|---|
| **Bug** | Double booking karena race condition |
| **Root Cause** | Read Committed isolation level tidak mencegah write skew |
| **Fix** | Serializable isolation + retry logic (P2034) |
| **File yang diubah** | `src/actions/reservation.ts` — fungsi `createReservation` dan `updateReservation` |
| **Impact** | Zero double booking di bawah concurrent access |
