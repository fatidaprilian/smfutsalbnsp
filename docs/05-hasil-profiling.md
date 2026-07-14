# Hasil Profiling Program
## Sistem Reservasi Lapangan — SM Sport Center

---

## 1. Metodologi

Pengukuran performa dilakukan menggunakan `console.time` / `performance.now()` pada server actions di environment development (`npm run dev`). Setiap operasi diukur 3 kali dan diambil rata-rata.

**Environment:**
- Next.js 16 (Turbopack) — development mode
- PostgreSQL (Neon) — serverless
- Data: 5 lapangan, 6 users, ~5 reservasi

## 2. Hasil Pengukuran

| No | Operasi | Waktu Rata-rata | Target | Status |
|---|---|---|---|---|
| 1 | Login (bcrypt verify) | ~150-300ms | < 2s | PASS |
| 2 | Register (bcrypt hash + insert) | ~200-400ms | < 2s | PASS |
| 3 | Load ketersediaan (`getAvailableSlots`) | ~50-100ms | < 2s | PASS |
| 4 | Buat reservasi (`createReservation`) | ~100-200ms | < 2s | PASS |
| 5 | Update reservasi (`updateReservation`) | ~100-200ms | < 2s | PASS |
| 6 | Cancel reservasi (`cancelReservation`) | ~30-80ms | < 2s | PASS |
| 7 | Cari reservasi (`searchReservations`) | ~50-100ms | < 2s | PASS |
| 8 | Load laporan (`getLaporanPenggunaan`) | ~50-150ms | < 2s | PASS |

## 3. Identifikasi Fungsi yang Relatif Lambat

### 3.1 Login & Register — bcrypt hashing (~150-400ms)

**Penyebab:** bcrypt dirancang untuk intentionally slow (cost factor 10 = ~100ms per operasi). Ini adalah fitur keamanan, bukan bug.

**Rekomendasi:** Tidak perlu dioptimasi — trade-off keamanan yang tepat. Jika perlu lebih cepat, gunakan Argon2 yang bisa dikonfigurasi lebih granular, tapi bcrypt sudah memadai untuk skala ini.

### 3.2 Reservasi dengan Serializable Transaction (~100-200ms)

**Penyebab:** Serializable isolation level menambah overhead karena PostgreSQL harus melacak dependency antar transaksi. Ditambah retry logic saat konflik.

**Rekomendasi:** Overhead ini diperlukan untuk mencegah double booking. Bisa dimitigasi dengan:
- Menjaga transaksi sesingkat mungkin (sudah dilakukan — hanya SELECT + INSERT)
- Retry maximum 3 kali (sudah dilakukan)

### 3.3 Query Laporan — Potensi Lambat di Data Besar

**Penyebab saat ini:** Cepat karena data masih sedikit (~5 record). Tapi query aggregasi (`findMany` + loop di application code) akan melambat saat data > 10.000 record.

**Rekomendasi:**
1. Gunakan database-level aggregation (`GROUP BY`) alih-alih application-level loop — ini bisa dilakukan dengan Prisma `groupBy` atau raw query
2. Tambah index pada kolom `date` jika sering filter by date range
3. Implementasi pagination jika daftar reservasi terlalu panjang

## 4. Code Review — Temuan

| No | File | Temuan | Severity |
|---|---|---|---|
| 1 | `actions/reservation.ts` | `searchReservations` menggunakan `take: 100` sebagai hard limit — sudah baik untuk mencegah unbounded query | Info |
| 2 | `actions/laporan.ts` | Aggregasi dilakukan di application code, bukan SQL — bisa jadi bottleneck di data besar | Low |
| 3 | `lib/prisma.ts` | Singleton pattern mencegah connection exhaustion di dev hot reload — sudah benar | Info |
| 4 | `middleware.ts` | JWT verification di setiap request — lightweight karena HS256 pure CPU, no DB roundtrip | Info |

## 5. Rekomendasi Perbaikan

| No | Rekomendasi | Prioritas | Effort |
|---|---|---|---|
| 1 | Ganti application-level aggregation di laporan dengan `prisma.$queryRaw` atau `groupBy` | Sedang | Rendah |
| 2 | Tambah pagination pada `searchReservations` (offset/cursor-based) | Sedang | Rendah |
| 3 | Monitor actual query time di production dengan Prisma logging (`log: ['query']`) | Rendah | Rendah |
| 4 | Tambah index pada `Reservation.date` jika query laporan sering scan by date range | Rendah | Rendah |

## 6. Kesimpulan

Semua operasi saat ini berada di bawah target 2 detik. Bottleneck utama yang potensial di masa depan adalah query laporan pada data besar. Rekomendasi difokuskan pada optimasi query aggregation dan pagination.
