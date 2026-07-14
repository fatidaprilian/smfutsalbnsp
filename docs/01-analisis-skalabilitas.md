# Dokumen Analisis Skalabilitas Perangkat Lunak
## Sistem Reservasi Lapangan — SM Sport Center

---

## 1. Identifikasi Aktor

| Aktor | Deskripsi | Hak Akses |
|---|---|---|
| **Admin** | Pengelola SM Sport Center | Login, lihat semua reservasi, filter/cari, batalkan reservasi, lihat laporan |
| **Customer** | Pelanggan yang ingin menyewa lapangan | Register, login, lihat ketersediaan, buat/edit/batalkan reservasi milik sendiri |

## 2. Kebutuhan Fungsional

| No | Kebutuhan | Solusi Problem |
|---|---|---|
| 1 | Register (customer mendaftar akun: nama, email, password) | Problem (b)(d) |
| 2 | Login (form tunggal untuk admin & customer, redirect berdasarkan role) | — |
| 3 | Logout | — |
| 4 | Lihat ketersediaan lapangan per tanggal (slot jam kosong vs terisi) | Problem (d) |
| 5 | Reservasi: tambah, lihat, edit, hapus, pencarian, validasi jadwal bentrok | Problem (a)(b) |
| 6 | Tampilan daftar reservasi (customer: miliknya; admin: semua) | Problem (b) |
| 7 | Laporan penggunaan lapangan (admin): filter periode + lapangan, total jam, total pendapatan | Problem (c) |

## 3. Kebutuhan Non-Fungsional

| No | Kebutuhan | Metrik |
|---|---|---|
| 1 | Waktu respons | Operasi CRUD < 2 detik |
| 2 | Keamanan password | Hash bcrypt, tidak ada plaintext |
| 3 | Otorisasi | Customer tidak bisa akses reservasi orang lain (dicek di server) |
| 4 | Responsivitas | Layout responsif (laptop + tablet) |

## 4. Estimasi Pertumbuhan Data

### Asumsi
- 5 lapangan (2 futsal + 3 badminton)
- Jam operasional: 08:00–22:00 (14 slot per lapangan)
- Rata-rata occupancy: 50% di hari biasa, 80% di akhir pekan
- 1 reservasi = 1–3 jam rata-rata

### Kalkulasi

| Periode | Estimasi Reservasi | Volume Data |
|---|---|---|
| Per hari (weekday) | ~20 reservasi | ~2 KB |
| Per hari (weekend) | ~30 reservasi | ~3 KB |
| Per bulan | ~650 reservasi | ~65 KB |
| Per tahun | ~7.800 reservasi | ~780 KB |
| 3 tahun | ~23.400 reservasi | ~2.3 MB |
| 5 tahun | ~39.000 reservasi | ~3.9 MB |

### Pertumbuhan User
- Estimasi 50 user baru/bulan → 600/tahun → 3.000 dalam 5 tahun
- Data user minimal (nama, email, hash) → ~500 KB dalam 5 tahun

**Total estimasi 5 tahun: < 5 MB data aktif** — sangat kecil untuk PostgreSQL.

## 5. Identifikasi Potensi Bottleneck

| No | Bottleneck | Dampak | Probabilitas |
|---|---|---|---|
| 1 | **Concurrent booking** — dua user memesan slot yang sama bersamaan | Double booking (problem a) | Tinggi |
| 2 | **Query laporan tanpa index** — aggregasi seluruh tabel reservasi | Waktu respons > 2 detik saat data besar | Sedang |
| 3 | **Connection pool exhaustion** — terlalu banyak koneksi database saat traffic tinggi | Request timeout | Rendah (skala saat ini) |
| 4 | **Session storage** — JWT di cookie tidak bisa di-revoke server-side | Logout di satu device tidak logout di device lain | Rendah |

## 6. Solusi yang Diimplementasikan

| Bottleneck | Solusi |
|---|---|
| Concurrent booking | Transaction dengan isolation level **Serializable** + retry logic (error P2034) |
| Query laporan lambat | Composite index `(courtId, date, status)` pada tabel Reservation |
| Connection pool | Singleton PrismaClient + pg Pool (reuse koneksi) |

## 7. Rekomendasi Peningkatan Performa (Pengembangan Lanjutan)

| No | Rekomendasi | Justifikasi |
|---|---|---|
| 1 | **Connection pooling via PgBouncer/Neon pooler** | Menangani lonjakan koneksi saat traffic tinggi |
| 2 | **Caching ketersediaan dengan Redis** | Mengurangi query database untuk halaman ketersediaan yang sering diakses |
| 3 | **Pagination pada daftar reservasi** | Mencegah query unbounded saat data > 10.000 record |
| 4 | **Payment gateway (Midtrans/Xendit)** | Mengurangi risiko no-show dengan sistem DP/pembayaran saat booking |
| 5 | **Rate limiting** | Mencegah abuse pada endpoint register dan login |
| 6 | **Monitoring & alerting** | Deteksi dini permasalahan performa di production |

## 8. Kesimpulan

Dengan volume data < 5 MB dalam 5 tahun dan < 50 concurrent users, sistem ini **tidak memerlukan arsitektur microservice atau distributed system**. Modular monolith dengan PostgreSQL dan index yang tepat sudah mencukupi. Bottleneck utama (concurrent booking) sudah diatasi dengan Serializable transaction. Rekomendasi pengembangan difokuskan untuk skenario pertumbuhan di luar proyeksi awal.
