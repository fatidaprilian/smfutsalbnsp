# Dokumen Analisis Skalabilitas Perangkat Lunak
## Sistem Reservasi Lapangan — SM Sport Center

---

## 1. Identifikasi Aktor

| Aktor | Deskripsi | Hak Akses |
|---|---|---|
| **Admin** | Pengelola SM Sport Center | Login, lihat semua reservasi, cari dan filter reservasi, batalkan reservasi, lihat laporan |
| **Customer** | Pelanggan yang ingin menyewa lapangan | Daftar akun, login, lihat ketersediaan lapangan, buat/ubah/batalkan reservasi milik sendiri |

---

## 2. Kebutuhan Fungsional

Berikut adalah fitur-fitur yang harus ada dalam sistem, beserta kaitan langsung dengan permasalahan yang ingin diselesaikan:

| No | Kebutuhan | Menyelesaikan Masalah |
|---|---|---|
| 1 | Daftar akun (customer mengisi nama, email, dan password) | Masalah (b)(d) |
| 2 | Login (satu halaman untuk admin dan customer, diarahkan ke halaman sesuai peran masing-masing) | — |
| 3 | Keluar (logout) | — |
| 4 | Lihat ketersediaan lapangan berdasarkan tanggal (tampilan jam kosong dan yang sudah terisi). Slot reservasi FULL yang dibatalkan tetap terkunci. | Masalah (d) |
| 5 | Reservasi: tambah, lihat, ubah, hapus, cari, dan cegah jadwal yang bentrok | Masalah (a)(b) |
| 6 | Daftar reservasi (customer hanya lihat miliknya; admin lihat semua) | Masalah (b) |
| 7 | Pembayaran DP (50%) atau Lunas (100%) via simulasi QRIS. DP bersifat non-refundable (hangus jika dibatalkan). | Masalah (b) |
| 8 | Laporan penggunaan lapangan (khusus admin): filter berdasarkan periode dan lapangan, total jam, total pendapatan (termasuk DP hangus) | Masalah (c) |

---

## 3. Kebutuhan Non-Fungsional

Kebutuhan yang berkaitan dengan kualitas sistem, bukan fitur:

| No | Kebutuhan | Ukuran |
|---|---|---|
| 1 | Kecepatan respons | Setiap operasi selesai dalam waktu kurang dari 2 detik |
| 2 | Keamanan kata sandi | Kata sandi tidak disimpan langsung — diubah terlebih dahulu menggunakan metode hash (bcrypt) sebelum tersimpan di database |
| 3 | Pembatasan akses | Customer tidak bisa melihat atau mengubah reservasi orang lain — pengecekan dilakukan di sisi server |
| 4 | Tampilan yang menyesuaikan layar | Tampilan nyaman digunakan di laptop maupun tablet |

---

## 4. Estimasi Pertumbuhan Data

### Asumsi Dasar
- 5 lapangan (2 futsal + 3 badminton)
- Jam operasional: 08:00–22:00 (14 slot per lapangan per hari)
- Rata-rata tingkat pemakaian: 50% di hari biasa, 80% di akhir pekan
- Setiap reservasi rata-rata berdurasi 1–3 jam

### Perkiraan Data

| Periode | Perkiraan Jumlah Reservasi | Ukuran Data |
|---|---|---|
| Per hari (hari biasa) | ~20 reservasi | ~2 KB |
| Per hari (akhir pekan) | ~30 reservasi | ~3 KB |
| Per bulan | ~650 reservasi | ~65 KB |
| Per tahun | ~7.800 reservasi | ~780 KB |
| 3 tahun | ~23.400 reservasi | ~2,3 MB |
| 5 tahun | ~39.000 reservasi | ~3,9 MB |

### Perkiraan Pertumbuhan Pengguna
- Perkiraan 50 pelanggan baru per bulan → 600 per tahun → 3.000 dalam 5 tahun
- Data setiap pelanggan (nama, email, kata sandi terenkripsi) sangat ringkas → ~500 KB dalam 5 tahun

**Total perkiraan data dalam 5 tahun: kurang dari 5 MB** — jumlah yang sangat kecil untuk sebuah database PostgreSQL.

---

## 5. Identifikasi Potensi Kemacetan (Bottleneck)

Bagian berikut menjelaskan titik-titik dalam sistem yang berpotensi mengalami masalah performa di kemudian hari:

| No | Potensi Masalah | Dampak | Kemungkinan Terjadi |
|---|---|---|---|
| 1 | **Dua pelanggan memesan slot yang sama di waktu bersamaan** — sistem bisa menyimpan keduanya jika tidak ditangani | Terjadi double booking (Masalah a) | Tinggi |
| 2 | **Laporan tanpa indeks database** — pengambilan data laporan dari seluruh tabel reservasi tanpa bantuan indeks | Waktu respons bisa melebihi 2 detik saat data sudah besar | Sedang |
| 3 | **Jumlah koneksi database yang terlalu banyak** — jika banyak pengguna mengakses sistem secara bersamaan | Permintaan bisa gagal atau menunggu terlalu lama | Rendah (untuk skala saat ini) |
| 4 | **Sesi login berbasis token** — token yang tersimpan di browser tidak bisa dibatalkan dari sisi server | Logout di satu perangkat tidak otomatis menutup sesi di perangkat lain | Rendah |

---

## 6. Solusi yang Sudah Diterapkan

| Potensi Masalah | Solusi yang Diterapkan |
|---|---|
| Dua orang memesan slot bersamaan | Proses penyimpanan reservasi dilakukan dalam satu blok transaksi database yang terkunci (*Serializable*), sehingga hanya satu yang bisa berhasil. Jika terjadi tabrakan, sistem mencoba ulang otomatis hingga 3 kali |
| Laporan lambat | Tabel reservasi diberi indeks gabungan pada kolom `(courtId, date, status)` sehingga pencarian data laporan jauh lebih cepat |
| Banyak koneksi database | Koneksi ke database dibuat satu kali dan digunakan bersama (*singleton pattern*), sehingga tidak terjadi pembuatan koneksi baru yang berlebihan |

---

## 7. Rekomendasi Peningkatan (Untuk Pengembangan Selanjutnya)

| No | Rekomendasi | Alasan |
|---|---|---|
| 1 | Gunakan pengelola koneksi seperti PgBouncer atau Neon Pooler | Untuk menangani lonjakan pengguna secara bersamaan di masa depan |
| 2 | Tambahkan sistem cache (misalnya Redis) untuk halaman ketersediaan lapangan | Mengurangi beban query ke database untuk halaman yang sering dikunjungi |
| 3 | Tambahkan pembagian halaman (pagination) pada daftar reservasi | Mencegah sistem memuat terlalu banyak data sekaligus saat jumlah reservasi sudah sangat besar |
| 4 | Integrasikan sistem pembayaran (misalnya Midtrans atau Xendit) | Mengurangi risiko pelanggan memesan tapi tidak datang |
| 5 | Tambahkan pembatasan jumlah permintaan (rate limiting) | Mencegah penyalahgunaan pada halaman daftar akun dan login |
| 6 | Tambahkan sistem pemantauan dan peringatan otomatis | Mendeteksi masalah performa lebih awal sebelum berdampak ke pengguna |

---

## 8. Kesimpulan

Dengan total data yang diperkirakan tidak melebihi 5 MB dalam 5 tahun dan jumlah pengguna yang relatif kecil (di bawah 50 pengguna aktif bersamaan), sistem ini **tidak memerlukan arsitektur yang rumit**. Sebuah aplikasi terpadu dengan database PostgreSQL dan indeks yang tepat sudah cukup memadai. Masalah utama yang paling berisiko — yaitu dua orang memesan slot yang sama secara bersamaan — telah diselesaikan dengan mekanisme transaksi terkunci. Rekomendasi pengembangan disusun untuk mengantisipasi pertumbuhan di luar perkiraan awal.
