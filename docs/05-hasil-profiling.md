# Hasil Profiling Program
## Sistem Reservasi Lapangan — SM Sport Center

---

## 1. Cara Pengukuran

Pengukuran kecepatan ini saya lakukan menggunakan perintah `console.time` / `performance.now()` yang saya tambahkan secara langsung pada setiap proses di server. Pengukuran saya jalankan di mode pengembangan (`npm run dev`). Setiap operasi saya ukur sebanyak 3 kali dan hasilnya saya ambil rata-rata.

**Kondisi saat pengukuran:**
- Next.js 16 (mode pengembangan)
- PostgreSQL (Neon) — layanan database berbasis cloud
- Data uji: 5 lapangan, 6 pengguna, ~5 reservasi

---

## 2. Hasil Pengukuran Kecepatan yang Saya Dapatkan

| No | Operasi | Waktu Rata-rata | Batas Waktu | Hasil |
|---|---|---|---|---|
| 1 | Login (cocokkan kata sandi) | ~150–300ms | < 2 detik | LULUS |
| 2 | Daftar akun (enkripsi kata sandi + simpan) | ~200–400ms | < 2 detik | LULUS |
| 3 | Muat ketersediaan lapangan | ~50–100ms | < 2 detik | LULUS |
| 4 | Buat reservasi baru | ~100–200ms | < 2 detik | LULUS |
| 5 | Ubah reservasi | ~100–200ms | < 2 detik | LULUS |
| 6 | Batalkan reservasi | ~30–80ms | < 2 detik | LULUS |
| 7 | Cari reservasi | ~50–100ms | < 2 detik | LULUS |
| 8 | Muat laporan | ~50–150ms | < 2 detik | LULUS |

---

## 3. Identifikasi Fungsi yang Relatif Lebih Lambat

### 3.1 Login dan Daftar Akun — Enkripsi Kata Sandi (~150–400ms)

**Penyebab:** Proses enkripsi kata sandi memang dirancang untuk berjalan lambat secara sengaja. Ini adalah fitur keamanan — semakin lama proses enkripsi, semakin sulit ditebak oleh pihak yang tidak bertanggung jawab.

**Rekomendasi:** Berdasarkan analisis saya, proses ini tidak perlu diubah. Waktu 150–400ms masih jauh di bawah batas 2 detik dan merupakan pertukaran yang wajar demi keamanan. Jika suatu saat perlu disesuaikan, saya bisa mempertimbangkan algoritma lain seperti Argon2, namun bcrypt sudah sangat memadai untuk skala sistem ini.

### 3.2 Buat dan Ubah Reservasi — Transaksi Terkunci (~100–200ms)

**Penyebab:** Proses penyimpanan reservasi menggunakan pengaturan transaksi yang lebih ketat (*Serializable*) untuk mencegah double booking. Pengaturan ini menambahkan sedikit waktu ekstra karena database perlu melacak hubungan antar proses yang berjalan bersamaan.

**Rekomendasi:** Waktu tambahan ini tidak bisa saya hindari karena memang sangat diperlukan. Yang sudah saya lakukan untuk meminimalkannya: saya memastikan proses dalam transaksi dibuat sesingkat mungkin (hanya cek bentrok + simpan data), dan batas percobaan ulang saya batasi maksimal 3 kali.

### 3.3 Laporan — Berpotensi Lambat saat Data Besar

**Kondisi saat ini:** Masih cepat karena data masih sedikit (~5 record). Namun, cara saya mengambil data laporan saat ini adalah dengan mengambil semua data lalu menghitungnya di sisi aplikasi — bukan di sisi database.

**Potensi masalah:** Saat jumlah reservasi sudah mencapai ribuan, proses ini bisa mulai terasa lambat.

**Rekomendasi:**
1. Saya sarankan untuk menggunakan kemampuan penghitungan bawaan database (`GROUP BY`) agar ringkasan dihitung langsung di database, bukan di aplikasi
2. Menambahkan indeks pada kolom tanggal jika laporan sering difilter berdasarkan rentang tanggal
3. Menambahkan pembagian halaman agar daftar reservasi tidak dimuat semuanya sekaligus

---

## 4. Hasil Code Review — Temuan Saya

| No | File | Temuan | Tingkat Risiko |
|---|---|---|---|
| 1 | `actions/reservation.ts` | Saya membatasi pencarian reservasi maksimal 100 data — mencegah sistem memuat terlalu banyak sekaligus | Informasi |
| 2 | `actions/laporan.ts` | Penghitungan laporan saat ini saya lakukan di sisi aplikasi, bukan di database — bisa jadi masalah saat data membesar | Rendah |
| 3 | `lib/prisma.ts` | Koneksi ke database saya buat satu kali dan dipakai bersama — sudah benar, mencegah pembuatan koneksi berlebihan | Informasi |
| 4 | `middleware.ts` | Pemeriksaan sesi login saya jalankan setiap ada permintaan halaman — ringan karena hanya membaca token, tidak perlu akses ke database | Informasi |

---

## 5. Rekomendasi Perbaikan

| No | Rekomendasi | Prioritas | Tingkat Kesulitan |
|---|---|---|---|
| 1 | Pindahkan penghitungan laporan ke sisi database menggunakan `groupBy` atau query mentah | Sedang | Rendah |
| 2 | Tambahkan pembagian halaman pada pencarian reservasi | Sedang | Rendah |
| 3 | Aktifkan pencatatan waktu query di production untuk pemantauan berkelanjutan | Rendah | Rendah |
| 4 | Tambahkan indeks pada kolom `tanggal` jika laporan sering difilter berdasarkan rentang tanggal | Rendah | Rendah |

---

## 6. Kesimpulan

Semua operasi yang saya uji berjalan lancar di bawah batas 2 detik. Tidak ada fungsi yang saat ini menjadi masalah nyata. Potensi perlambatan di masa depan yang paling perlu saya antisipasi adalah penghitungan laporan saat volume data sudah sangat besar. Rekomendasi perbaikan yang saya susun difokuskan pada area tersebut.
