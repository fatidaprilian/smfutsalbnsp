# Laporan Integrasi Testing
## Sistem Reservasi Lapangan — SM Sport Center

---

## 1. Alur Pengujian Integrasi

```
Login → Lihat Ketersediaan → Buat Reservasi → Lihat Daftar → Edit Reservasi → Cancel → Lihat Laporan (Admin)
```

## 2. Skenario Pengujian

### Skenario 1: Alur Customer (Login → Reservasi → Edit → Cancel)

| Langkah | Aksi | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| 1 | Buka /login | Form login ditampilkan | — | TBD |
| 2 | Input email: budi@email.com, password: password123 | Redirect ke /reservations | — | TBD |
| 3 | Pilih tanggal besok | Grid ketersediaan per lapangan ditampilkan | — | TBD |
| 4 | Pilih Futsal B, jam 10:00–12:00, klik "Reservasi" | Pesan "Reservasi berhasil dibuat!", data muncul di daftar | — | TBD |
| 5 | Klik "Edit" pada reservasi yang baru dibuat | Form edit muncul inline | — | TBD |
| 6 | Ubah jam ke 12:00–14:00, klik "Simpan" | Reservasi terupdate, jam berubah di daftar | — | TBD |
| 7 | Klik "Batalkan" pada reservasi | Konfirmasi dialog → status berubah ke "Dibatalkan" | — | TBD |
| 8 | Klik "Logout" | Redirect ke /login | — | TBD |

### Skenario 2: Alur Admin (Login → Lihat Semua → Cancel → Laporan)

| Langkah | Aksi | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| 1 | Login: admin@smsportcenter.com / admin123 | Redirect ke /admin/reservations | — | TBD |
| 2 | Lihat daftar reservasi | Semua reservasi dari semua customer ditampilkan | — | TBD |
| 3 | Filter by lapangan "Futsal A" | Hanya reservasi Futsal A yang tampil | — | TBD |
| 4 | Cari "Budi" di search | Reservasi milik Budi tampil | — | TBD |
| 5 | Klik "Batalkan" pada salah satu reservasi | Status berubah ke "Dibatalkan" | — | TBD |
| 6 | Navigasi ke /admin/laporan | Halaman laporan ditampilkan | — | TBD |
| 7 | Filter periode bulan ini, klik "Tampilkan Laporan" | Total jam dan total pendapatan ditampilkan, breakdown per lapangan | — | TBD |

### Skenario 3: Validasi Bentrok

| Langkah | Aksi | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| 1 | Login sebagai customer | Redirect ke /reservations | — | TBD |
| 2 | Buat reservasi: Futsal A, besok, 08:00–10:00 | Berhasil (asumsi slot kosong) | — | TBD |
| 3 | Buat reservasi lagi: Futsal A, besok, 09:00–11:00 | Pesan error "Jadwal bentrok!" | — | TBD |

### Skenario 4: Register Customer Baru

| Langkah | Aksi | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| 1 | Buka /register | Form register ditampilkan | — | TBD |
| 2 | Input nama, email baru, password (min 8 char) | Redirect ke /login dengan pesan "Registrasi berhasil!" | — | TBD |
| 3 | Login dengan akun baru | Redirect ke /reservations | — | TBD |
| 4 | Register lagi dengan email yang sama | Pesan error "Email sudah terdaftar" | — | TBD |

### Skenario 5: Akses Kontrol

| Langkah | Aksi | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| 1 | Customer akses /admin/reservations | Redirect ke /reservations | — | TBD |
| 2 | Belum login akses /reservations | Redirect ke /login | — | TBD |
| 3 | Admin akses /reservations | Redirect ke /admin/reservations | — | TBD |

## 3. Catatan

- Status TBD menandakan skenario yang akan dieksekusi saat demo (live testing)
- Screenshot per langkah akan ditambahkan setelah testing dengan database yang terkoneksi
- Actual result dan status akan diupdate saat testing berlangsung

## 4. Evaluasi dan Perbaikan

*Bagian ini akan diisi setelah testing dilaksanakan. Jika ditemukan kesalahan, akan didokumentasikan beserta perbaikan yang dilakukan.*
