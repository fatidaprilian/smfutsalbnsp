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
| 1 | Buka halaman /login | Formulir login ditampilkan | — | TBD |
| 2 | Isi email: budi@email.com, kata sandi: password123, klik "Masuk" | Diarahkan ke halaman /reservations | — | TBD |
| 3 | Pilih tanggal besok | Tampilan ketersediaan jam per lapangan muncul | — | TBD |
| 4 | Pilih Futsal B, jam 10:00–12:00, klik "Reservasi" | Pesan "Reservasi berhasil dibuat!", data muncul di daftar | — | TBD |
| 5 | Klik "Ubah" pada reservasi yang baru dibuat | Formulir ubah muncul | — | TBD |
| 6 | Ganti jam ke 12:00–14:00, klik "Simpan" | Reservasi berhasil diperbarui, jam berubah di daftar | — | TBD |
| 7 | Klik "Batalkan" pada reservasi | Muncul konfirmasi → status berubah menjadi "Dibatalkan" | — | TBD |
| 8 | Klik "Keluar" | Diarahkan ke halaman login | — | TBD |

### Skenario 2: Alur Admin (Login → Lihat Semua → Batalkan → Laporan)

| Langkah | Tindakan | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|
| 1 | Login: admin@smsportcenter.com / admin123 | Diarahkan ke /admin/reservations | — | TBD |
| 2 | Lihat daftar reservasi | Semua reservasi dari semua pelanggan ditampilkan | — | TBD |
| 3 | Filter berdasarkan lapangan "Futsal A" | Hanya reservasi Futsal A yang ditampilkan | — | TBD |
| 4 | Cari "Budi" di kotak pencarian | Reservasi milik Budi ditampilkan | — | TBD |
| 5 | Klik "Batalkan" pada salah satu reservasi | Status berubah menjadi "Dibatalkan" | — | TBD |
| 6 | Buka halaman /admin/laporan | Halaman laporan ditampilkan | — | TBD |
| 7 | Filter periode bulan ini, klik "Tampilkan Laporan" | Total jam dan total pendapatan ditampilkan, rincian per lapangan | — | TBD |

### Skenario 3: Uji Coba Jadwal Bentrok

| Langkah | Tindakan | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|
| 1 | Login sebagai pelanggan | Diarahkan ke /reservations | — | TBD |
| 2 | Buat reservasi: Futsal A, besok, 08:00–10:00 | Berhasil (asumsi slot masih kosong) | — | TBD |
| 3 | Buat reservasi lagi: Futsal A, besok, 09:00–11:00 | Muncul pesan error "Jadwal bentrok!" | — | TBD |

### Skenario 4: Daftar Akun Pelanggan Baru

| Langkah | Tindakan | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|
| 1 | Buka halaman /register | Formulir pendaftaran ditampilkan | — | TBD |
| 2 | Isi nama, email baru, kata sandi (minimal 8 karakter), klik "Daftar" | Diarahkan ke halaman login | — | TBD |
| 3 | Login dengan akun yang baru dibuat | Diarahkan ke /reservations | — | TBD |
| 4 | Daftar lagi menggunakan email yang sama | Muncul pesan error "Email sudah terdaftar" | — | TBD |

### Skenario 5: Uji Pembatasan Akses

| Langkah | Tindakan | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|
| 1 | Pelanggan mencoba buka /admin/reservations | Diarahkan ke /reservations | — | TBD |
| 2 | Pengguna yang belum login mencoba buka /reservations | Diarahkan ke /login | — | TBD |
| 3 | Admin mencoba buka /reservations | Diarahkan ke /admin/reservations | — | TBD |

---

## 3. Catatan

- Status **TBD** (To Be Done) menandakan skenario yang akan dijalankan secara langsung saat demo atau sesi pengujian dengan database yang sudah terhubung
- Tangkapan layar setiap langkah akan ditambahkan setelah pengujian dilaksanakan
- Kolom "Hasil Aktual" dan "Status" akan diperbarui selama pengujian berlangsung

---

## 4. Evaluasi dan Perbaikan

*Bagian ini akan diisi setelah pengujian dilaksanakan. Jika ditemukan kesalahan atau perilaku yang tidak sesuai, akan dicatat di sini beserta langkah perbaikan yang diambil.*
