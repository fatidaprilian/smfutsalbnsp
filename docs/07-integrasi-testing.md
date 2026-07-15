# Laporan Integrasi Testing
## Sistem Reservasi Lapangan — SM Sport Center

---

## 1. Alur Pengujian Integrasi

Pengujian integrasi bertujuan untuk memastikan semua bagian sistem bekerja dengan baik secara keseluruhan dari sudut pandang pengguna. Alur pengujian yang dilakukan:

```
Login → Lihat Ketersediaan → Buat Reservasi → Lihat Daftar → Ubah Reservasi → Batalkan → Lihat Laporan (Admin)
```

---

## 2. Skenario Pengujian

### Skenario 1: Alur Pelanggan (Login → Reservasi → Ubah → Batalkan)

| Langkah | Tindakan | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|
| 1 | Buka halaman /login | Formulir login ditampilkan | Formulir tampil dengan benar | LULUS |
| 2 | Isi email: budi@email.com, kata sandi: password123, klik "Masuk" | Diarahkan ke halaman /reservations | Berhasil masuk dan pindah halaman | LULUS |
| 3 | Pilih tanggal besok | Tampilan ketersediaan jam per lapangan muncul | Jadwal kosong dan terisi terlihat jelas | LULUS |
| 4 | Pilih Futsal B, jam 10:00–12:00, klik "Reservasi" | Pesan "Reservasi berhasil dibuat!", data muncul di daftar | Reservasi tersimpan ke database | LULUS |
| 5 | Klik "Ubah" pada reservasi yang baru dibuat | Formulir ubah muncul | Formulir tampil membawa data lama | LULUS |
| 6 | Ganti jam ke 12:00–14:00, klik "Simpan" | Reservasi berhasil diperbarui, jam berubah di daftar | Data berubah secara seketika | LULUS |
| 7 | Klik "Batalkan" pada reservasi | Muncul konfirmasi → status berubah menjadi "Dibatalkan" | Status menjadi CANCELLED | LULUS |
| 8 | Klik "Keluar" | Diarahkan ke halaman login | Sesi terhapus, kembali ke login | LULUS |

### Skenario 2: Alur Admin (Login → Lihat Semua → Batalkan → Laporan)

| Langkah | Tindakan | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|
| 1 | Login: admin@smsportcenter.com / admin123 | Diarahkan ke /admin/reservations | Masuk sebagai admin | LULUS |
| 2 | Lihat daftar reservasi | Semua reservasi dari semua pelanggan ditampilkan | Seluruh data pelanggan tampil | LULUS |
| 3 | Filter berdasarkan lapangan "Futsal A" | Hanya reservasi Futsal A yang ditampilkan | Tabel terfilter dengan benar | LULUS |
| 4 | Cari "Budi" di kotak pencarian | Reservasi milik Budi ditampilkan | Pencarian nama berfungsi | LULUS |
| 5 | Klik "Batalkan" pada salah satu reservasi | Status berubah menjadi "Dibatalkan" | Reservasi berhasil dibatalkan admin | LULUS |
| 6 | Buka halaman /admin/laporan | Halaman laporan ditampilkan | Halaman termuat dengan benar | LULUS |
| 7 | Filter periode bulan ini, klik "Tampilkan Laporan" | Total jam dan total pendapatan ditampilkan, rincian per lapangan | Kalkulasi laporan akurat | LULUS |

### Skenario 3: Uji Coba Jadwal Bentrok

| Langkah | Tindakan | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|
| 1 | Login sebagai pelanggan | Diarahkan ke /reservations | Berhasil masuk | LULUS |
| 2 | Buat reservasi: Futsal A, besok, 08:00–10:00 | Berhasil (asumsi slot masih kosong) | Reservasi pertama berhasil | LULUS |
| 3 | Buat reservasi lagi: Futsal A, besok, 09:00–11:00 | Muncul pesan error "Jadwal bentrok!" | Transaksi ditolak, error tampil | LULUS |

### Skenario 4: Daftar Akun Pelanggan Baru

| Langkah | Tindakan | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|
| 1 | Buka halaman /register | Formulir pendaftaran ditampilkan | Tampil dengan benar | LULUS |
| 2 | Isi nama, email baru, kata sandi (minimal 8 karakter), klik "Daftar" | Diarahkan ke halaman login | Akun baru masuk ke database | LULUS |
| 3 | Login dengan akun yang baru dibuat | Diarahkan ke /reservations | Berhasil masuk | LULUS |
| 4 | Daftar lagi menggunakan email yang sama | Muncul pesan error "Email sudah terdaftar" | Ditolak karena email duplikat | LULUS |

### Skenario 5: Simulasi E-Wallet & Pelunasan Kasir (Cross-Device)

| Langkah | Tindakan | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|
| 1 | Pelanggan pesan lapangan dan pilih tipe bayar "DP 50%" | Reservasi tersimpan dengan status `PENDING` | Status menjadi PENDING | LULUS |
| 2 | Klik tombol "Bayar QRIS" di daftar reservasi | Muncul Modal berisi QR Code pembayaran | Modal QR Code tampil dengan nominal setengah harga | LULUS |
| 3 | Scan QR Code menggunakan HP (Membuka /pay/[id]) | Halaman simulasi E-Wallet terbuka di HP | Halaman E-Wallet tampil tanpa login | LULUS |
| 4 | Klik "Bayar Sekarang" di HP | Status berubah jadi `CONFIRMED` | Database terupdate jadi CONFIRMED | LULUS |
| 5 | Admin login dan cek data reservasi tersebut | Tampil label `DP 50%` dan ada tombol "Pelunasan" | Tombol Pelunasan muncul | LULUS |
| 6 | Admin klik "Pelunasan" | Status berubah menjadi `COMPLETED` | Status tuntas dan lunas | LULUS |

### Skenario 6: Uji Pembatasan Akses

| Langkah | Tindakan | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|
| 1 | Pelanggan mencoba buka /admin/reservations | Diarahkan ke /reservations | Ditolak, dialihkan ke halaman pelanggan | LULUS |
| 2 | Pengguna yang belum login mencoba buka /reservations | Diarahkan ke /login | Ditolak, dialihkan ke login | LULUS |
| 3 | Admin mencoba buka /reservations | Diarahkan ke /admin/reservations | Dialihkan ke dasbor admin | LULUS |

---

## 3. Catatan Pengujian

- Pengujian integrasi ini dilakukan di lingkungan pengembangan (*development environment*) yang mereplika kondisi server produksi.
- Seluruh pengujian *Black Box* (berdasarkan antarmuka pengguna) berjalan mulus tanpa hambatan.

---

## 4. Evaluasi dan Perbaikan

**Evaluasi:** 
Berdasarkan hasil pengujian pada 5 skenario utama di atas, seluruh alur sistem (*End-to-End*) dari mulai registrasi hingga pembuatan laporan oleh admin telah **berjalan 100% sesuai dengan spesifikasi kebutuhan perangkat lunak**. Sistem berhasil menangani jalur normal (*happy path*) maupun menolak jalur kesalahan (*error path*) dengan menampilkan pesan yang tepat sasaran.

**Tindakan Perbaikan:**
Mengingat tingkat kelulusan skenario mencapai 100% pada tahap ini, **tidak ada tindakan perbaikan (bug fixing) lanjutan yang diperlukan** dalam rilis ini. Sistem sudah stabil dan siap digunakan di SM Sport Center. (Catatan: perbaikan *double booking* sebelumnya telah diselesaikan pada fase *Unit Testing* dan *Debugging* awal, sehingga tahap *Integration Testing* ini sudah bersih dari masalah tersebut).
