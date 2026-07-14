# Dokumentasi Kode Program
## Sistem Reservasi Lapangan — SM Sport Center

---

## 1. Struktur Database

Sistem menggunakan 3 tabel utama pada PostgreSQL:

| Tabel | Deskripsi | Relasi |
|---|---|---|
| `User` | Data pengguna (admin dan customer) | 1:N ke Reservation |
| `Court` | Data lapangan (futsal/badminton) | 1:N ke Reservation |
| `Reservation` | Data reservasi | N:1 ke User, N:1 ke Court |

Detail lengkap skema ada di dokumen ERD & SQL Script.

## 2. Struktur Modul

```
app/
├── prisma/
│   ├── schema.prisma          # Definisi tabel database
│   └── seed.ts                # Data awal (courts, users, reservations)
├── prisma.config.ts           # Konfigurasi Prisma 7
├── src/
│   ├── generated/prisma/      # Prisma Client (auto-generated)
│   ├── lib/
│   │   ├── prisma.ts          # Singleton database connection
│   │   ├── auth.ts            # Hash password, session JWT, cookie management
│   │   └── validations.ts     # Schema validasi Zod untuk semua input
│   ├── actions/
│   │   ├── auth.ts            # Server actions: register, login, logout
│   │   ├── reservation.ts     # Server actions: CRUD reservasi + conflict check
│   │   └── laporan.ts         # Server action: laporan penggunaan lapangan
│   ├── components/
│   │   └── navbar.tsx         # Navigasi dengan link conditional per role
│   ├── middleware.ts          # Route protection & redirect
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Redirect ke halaman sesuai role
│   │   ├── login/page.tsx     # Halaman login
│   │   ├── register/page.tsx  # Halaman register customer
│   │   ├── reservations/
│   │   │   ├── page.tsx       # Server component: fetch data
│   │   │   └── client.tsx     # Client component: UI interaktif
│   │   └── admin/
│   │       ├── reservations/
│   │       │   ├── page.tsx   # Server component: fetch data
│   │       │   └── client.tsx # Client component: filter & cancel
│   │       └── laporan/
│   │           ├── page.tsx   # Server component: fetch courts
│   │           └── client.tsx # Client component: form & tabel laporan
│   └── __tests__/
│       ├── auth.test.ts       # Unit test: login logic
│       └── reservation.test.ts # Unit test: conflict & price logic
└── vitest.config.ts           # Konfigurasi Vitest
```

## 3. Deskripsi Fungsi per Modul

### 3.1 `lib/auth.ts` — Modul Autentikasi

| Fungsi | Deskripsi |
|---|---|
| `hashPassword(password)` | Hash password menggunakan bcrypt (cost factor 10) |
| `verifyPassword(password, hash)` | Bandingkan password plaintext dengan hash bcrypt |
| `createSession(userId, role)` | Buat JWT token (HS256, expire 24 jam), simpan di HttpOnly cookie `__Host-session` |
| `getSession()` | Baca dan verifikasi JWT dari cookie, return `{userId, role}` atau null |
| `destroySession()` | Hapus session cookie |

### 3.2 `lib/validations.ts` — Schema Validasi

| Schema | Field | Validasi |
|---|---|---|
| `loginSchema` | email, password | Email valid, password min 8 char |
| `registerSchema` | name, email, password | Nama min 1 char, email valid, password min 8 max 128 char |
| `reservationSchema` | courtId, date, startHour, endHour | courtId non-empty, date valid, jam 8–22, endHour > startHour |
| `searchReservationSchema` | query?, courtId?, date?, status? | Status enum CONFIRMED/CANCELLED |
| `laporanSchema` | startDate, endDate, courtId? | Tanggal valid |

### 3.3 `actions/auth.ts` — Server Actions Autentikasi

| Action | Input | Proses | Output |
|---|---|---|---|
| `registerCustomer` | FormData (name, email, password) | Validasi Zod → cek email unik → hash bcrypt → insert User | Redirect ke /login |
| `login` | FormData (email, password) | Validasi Zod → cari user → verify bcrypt → buat session → redirect by role | Redirect ke /reservations atau /admin/reservations |
| `logout` | — | Hapus session cookie | Redirect ke /login |

### 3.4 `actions/reservation.ts` — Server Actions Reservasi

| Action | Input | Proses | Output |
|---|---|---|---|
| `getAvailableSlots` | dateStr | Ambil semua court + reservasi CONFIRMED di tanggal itu → map ke slot array | Array court dengan slot kosong/terisi |
| `createReservation` | FormData | Validasi → **Transaction Serializable** (cek bentrok → hitung harga → insert) → retry P2034 | `{success}` atau `{error}` |
| `updateReservation` | reservationId, FormData | Cek ownership → Validasi → **Transaction Serializable** (cek bentrok exclude self → update) | `{success}` atau `{error}` |
| `cancelReservation` | reservationId | Cek ownership → update status ke CANCELLED | `{success}` atau `{error}` |
| `searchReservations` | filters | Customer: filter miliknya; Admin: filter semua | Array reservasi |

**Fungsi internal:**

| Fungsi | Deskripsi |
|---|---|
| `checkConflict(tx, courtId, date, startHour, endHour, excludeId?)` | Cek apakah ada reservasi CONFIRMED yang overlap dengan slot yang diminta |
| `withSerializableRetry(fn, maxRetries)` | Wrapper retry untuk menangani error P2034 (serialization failure) |

### 3.5 `actions/laporan.ts` — Server Action Laporan

| Action | Input | Proses | Output |
|---|---|---|---|
| `getLaporanPenggunaan` | startDate, endDate, courtId? | Cek admin → validasi → query CONFIRMED saja → agregasi per court | `{totalJam, totalPendapatan, perLapangan[]}` |

### 3.6 `middleware.ts` — Route Protection

| Kondisi | Aksi |
|---|---|
| Belum login + bukan halaman publik | Redirect ke /login |
| Sudah login + halaman login/register | Redirect ke halaman sesuai role |
| Customer akses /admin/* | Redirect ke /reservations |
| Admin akses /reservations | Redirect ke /admin/reservations |

## 4. Algoritma Utama: Validasi Bentrok

```
FUNCTION checkConflict(courtId, date, startHour, endHour, excludeId):
  existing = SELECT FROM Reservation
             WHERE courtId = courtId
               AND date = date
               AND status = 'CONFIRMED'
               AND startHour < endHour    // reservasi lain mulai sebelum slot baru selesai
               AND endHour > startHour    // reservasi lain selesai setelah slot baru mulai
               AND id != excludeId        // kecualikan diri sendiri saat edit
  RETURN existing.count > 0
```

Dijalankan di dalam transaction dengan isolation level **Serializable** untuk mencegah race condition.
