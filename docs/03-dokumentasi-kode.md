# Dokumentasi Kode Program
## Sistem Reservasi Lapangan — SM Sport Center

---

## 1. Struktur Database

Sistem menggunakan 3 tabel utama di dalam database PostgreSQL:

| Tabel | Keterangan | Hubungan |
|---|---|---|
| `User` | Menyimpan data pengguna (admin dan pelanggan) | Satu pengguna bisa memiliki banyak reservasi |
| `Court` | Menyimpan data lapangan (futsal/badminton) | Satu lapangan bisa memiliki banyak reservasi |
| `Reservation` | Menyimpan data reservasi | Setiap reservasi terhubung ke satu pengguna dan satu lapangan |

Detail lengkap kolom dan hubungan antar tabel tersedia di dokumen ERD & SQL Script.

---

## 2. Struktur Folder Proyek

```
app/
├── prisma/
│   ├── schema.prisma          # Definisi struktur tabel database
│   └── seed.ts                # Data awal (lapangan, pengguna, reservasi contoh)
├── prisma.config.ts           # Pengaturan koneksi Prisma ke database
├── src/
│   ├── generated/prisma/      # Kode akses database yang dibuat otomatis oleh Prisma
│   ├── lib/
│   │   ├── prisma.ts          # Pengaturan koneksi database (satu koneksi dibagi bersama)
│   │   ├── auth.ts            # Fungsi enkripsi kata sandi, buat sesi login, kelola cookie
│   │   └── validations.ts     # Aturan validasi untuk semua input dari pengguna
│   ├── actions/
│   │   ├── auth.ts            # Proses: daftar akun, login, logout
│   │   ├── reservation.ts     # Proses: tambah/ubah/batalkan/cari reservasi + cek jadwal bentrok
│   │   └── laporan.ts         # Proses: mengambil data laporan penggunaan lapangan
│   ├── components/
│   │   └── navbar.tsx         # Navigasi atas (menu berbeda untuk admin dan customer)
│   ├── middleware.ts           # Pengaman halaman: arahkan pengguna ke halaman yang sesuai
│   │   ├── app/
│   │   │   ├── layout.tsx         # Tampilan dasar yang dipakai semua halaman
│   │   │   ├── page.tsx           # Halaman utama (langsung diarahkan sesuai peran pengguna)
│   │   │   ├── login/page.tsx     # Halaman login
│   │   │   ├── register/page.tsx  # Halaman daftar akun (khusus pelanggan)
│   │   │   ├── pay/[id]/          # Route Publik E-Wallet Simulasi
│   │   │   │   ├── page.tsx       # Ambil data reservasi dari server
│   │   │   │   └── client.tsx     # Antarmuka E-Wallet interaktif
│   │   │   ├── reservations/
│   │   │   │   ├── page.tsx       # Ambil data reservasi dari server
│   │   │   │   └── client.tsx     # Tampilan interaktif untuk pelanggan
│   │   │   └── admin/
│   │   │       ├── reservations/
│   │   │       │   ├── page.tsx   # Ambil semua data reservasi dari server
│   │   │       │   └── client.tsx # Tampilan dengan filter dan tombol batalkan (admin)
│   │   │       └── laporan/
│   │   │           ├── page.tsx   # Ambil daftar lapangan dari server
│   │   │           └── client.tsx # Tampilan form laporan dan tabel hasil
│   │   └── __tests__/
│   │       ├── auth.test.ts       # Pengujian unit: logika login
│   │       └── reservation.test.ts # Pengujian unit: cek bentrok jadwal dan kalkulasi harga
└── vitest.config.ts           # Pengaturan alat pengujian otomatis (Vitest)
```

---

## 3. Deskripsi Fungsi per Bagian

### 3.1 `lib/auth.ts` — Bagian Keamanan Akun

| Nama Fungsi | Penjelasan |
|---|---|
| `hashPassword(password)` | Mengubah kata sandi menjadi teks terenkripsi menggunakan bcrypt sebelum disimpan ke database |
| `verifyPassword(password, hash)` | Membandingkan kata sandi yang diketik pengguna dengan kata sandi terenkripsi di database |
| `createSession(userId, role)` | Membuat token sesi login yang berlaku selama 24 jam dan menyimpannya di cookie browser yang aman |
| `getSession()` | Membaca token sesi dari cookie dan mengembalikan identitas pengguna (ID dan peran), atau `null` jika belum login |
| `destroySession()` | Menghapus cookie sesi saat pengguna logout |

### 3.2 `lib/validations.ts` — Aturan Validasi Input

| Nama Skema | Kolom yang Dicek | Aturan |
|---|---|---|
| `loginSchema` | email, password | Email harus format yang valid, kata sandi minimal 8 karakter |
| `registerSchema` | name, email, password | Nama wajib diisi, email valid, kata sandi antara 8–128 karakter |
| `reservationSchema` | courtId, date, startHour, endHour, paymentType | Lapangan wajib, tanggal valid, jam 08:00–22:00, jam selesai > jam mulai, tipe bayar DP/FULL |
| `searchReservationSchema` | query?, courtId?, date?, status? | Status boleh PENDING, CONFIRMED, COMPLETED, CANCELLED |
| `laporanSchema` | startDate, endDate, courtId? | Kedua tanggal harus valid |

### 3.3 `actions/auth.ts` — Proses Autentikasi

| Proses | Data Masuk | Langkah-langkah | Hasil |
|---|---|---|---|
| `registerCustomer` | Nama, email, kata sandi | Periksa data → cek apakah email sudah terdaftar → enkripsi kata sandi → simpan ke database | Diarahkan ke halaman login |
| `login` | Email, kata sandi | Periksa data → cari pengguna → cocokkan kata sandi → buat sesi → arahkan sesuai peran | Diarahkan ke halaman yang sesuai (pelanggan atau admin) |
| `logout` | — | Hapus cookie sesi | Diarahkan ke halaman login |

### 3.4 `actions/reservation.ts` — Proses Reservasi

| Proses | Data Masuk | Langkah-langkah | Hasil |
|---|---|---|---|
| `getAvailableSlots` | Tanggal | Ambil lapangan + cek reservasi terkonfirmasi & pending → tampilkan slot kosong/terisi | Daftar lapangan beserta keterangan slot per jam |
| `createReservation` | Data formulir | Periksa data → jalankan transaksi terkunci (cek bentrok → hitung harga → simpan sbg PENDING) | `{berhasil}` atau `{pesan error}` |
| `updateReservation` | ID reservasi, data formulir | Cek kepemilikan → Periksa data → jalankan proses terkunci (cek bentrok kecuali reservasi sendiri → perbarui data) | `{berhasil}` atau `{pesan error}` |
| `cancelReservation` | ID reservasi | Cek kepemilikan → ubah status menjadi CANCELLED | `{berhasil}` atau `{pesan error}` |
| `searchReservations` | Filter (lapangan, tanggal, status, kata kunci) | Pelanggan: hanya menampilkan miliknya; Admin: menampilkan semua | Daftar reservasi yang sesuai filter |
| `processWalletPayment` | ID reservasi | Dicetuskan oleh E-Wallet → ubah status dari PENDING ke CONFIRMED | `{berhasil}` atau `{pesan error}` |
| `completeReservation` | ID reservasi | Cek hak Admin → ubah status menjadi COMPLETED (Pelunasan) | `{berhasil}` atau `{pesan error}` |

**Fungsi pendukung internal:**

| Nama Fungsi | Penjelasan |
|---|---|
| `checkConflict(...)` | Memeriksa apakah ada reservasi lain yang sudah terkonfirmasi dan waktunya bertabrakan dengan slot yang diminta |
| `withSerializableRetry(fn, maxRetries)` | Menjalankan ulang proses otomatis jika database menolak karena ada dua permintaan yang bertabrakan di waktu bersamaan |

### 3.5 `actions/laporan.ts` — Proses Laporan

| Proses | Data Masuk | Langkah-langkah | Hasil |
|---|---|---|---|
| `getLaporanPenggunaan` | Tanggal mulai, tanggal selesai, lapangan (opsional) | Cek hak akses admin → periksa data → ambil data reservasi terkonfirmasi → hitung total | `{totalJam, totalPendapatan, rincianPerLapangan[]}` |

### 3.6 `middleware.ts` — Pengaman Halaman

| Kondisi | Tindakan Sistem |
|---|---|
| Belum login dan mencoba akses halaman yang memerlukan login | Diarahkan ke halaman login |
| Sudah login tapi membuka halaman login atau daftar | Diarahkan ke halaman utama sesuai peran |
| Pelanggan mencoba akses halaman admin | Diarahkan ke halaman reservasi pelanggan |
| Admin membuka halaman reservasi pelanggan | Diarahkan ke halaman reservasi admin |

---

## 4. Algoritma Utama: Pengecekan Jadwal Bentrok

Berikut adalah logika pengecekan yang digunakan untuk mencegah double booking:

```
FUNGSI cekBentrok(lapangan, tanggal, jamMulai, jamSelesai, kecualikanId):
  data = AMBIL DARI Reservation
         WHERE lapangan = lapangan
           AND tanggal = tanggal
           AND status IN ('CONFIRMED', 'PENDING')
           AND jamMulai reservasi lain < jamSelesai yang diminta
           AND jamSelesai reservasi lain > jamMulai yang diminta
           AND id != kecualikanId   (diabaikan saat sedang mengedit reservasi sendiri)
  KEMBALIKAN data.jumlah > 0
```

**Penjelasan logika pengecekan overlap jam:**
Dua rentang waktu dianggap bertabrakan apabila: rentang pertama dimulai sebelum rentang kedua selesai, **dan** rentang pertama selesai setelah rentang kedua dimulai.

Contoh: slot 08:00–10:00 yang sudah ada akan bertabrakan dengan permintaan 09:00–11:00, karena 09:00 < 10:00 dan 11:00 > 08:00.

Fungsi ini dijalankan di dalam proses database yang terkunci (*Serializable transaction*) untuk memastikan tidak ada dua permintaan yang bisa lolos secara bersamaan.
