# SM Sport Center - Sistem Reservasi Lapangan

Sistem Manajemen Reservasi Lapangan Olahraga (Futsal & Badminton) berbasis web, dirancang secara khusus untuk **SM Sport Center**. Aplikasi ini dibangun untuk memfasilitasi pemesanan lapangan yang lebih profesional, cepat, transparan, dan menjamin jadwal yang anti-bentrok (*anti-double booking*).

Proyek ini juga disusun sebagai portofolio pemenuhan standar **Uji Kompetensi Analis Program (BNSP)**.

## Fitur Utama

* **Sistem Otentikasi (Role-based)**: Terdapat dua peran utama, yaitu `CUSTOMER` dan `ADMIN` dengan otorisasi JWT yang aman.
* **Anti-Double Booking**: Sistem transaksional database yang ketat (Tingkat Isolasi Serializable) memastikan satu jadwal tidak akan pernah bisa dipesan oleh dua orang di waktu yang bersamaan.
* **Live Schedule Preview**: Pengguna bisa langsung mengecek jadwal lapangan yang tersedia secara *real-time* langsung dari *landing page* tanpa perlu login.
* **Panel Admin & Pelaporan**: Manajemen laporan terpusat bagi pengurus (Admin) untuk melihat seluruh jadwal, transaksi, dan riwayat pesanan pelanggan.
* **Desain UI/UX Premium**: Antarmuka modern yang tidak kaku, dirancang dengan Tailwind CSS dan Plus Jakarta Sans typography.

## Teknologi yang Digunakan

* **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
* **Database ORM**: [Prisma](https://www.prisma.io/)
* **Database Engine**: PostgreSQL
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Testing**: Vitest (Unit & Integration Testing)
* **Auth**: Custom JWT session handling dengan library `jose`

## Struktur Repositori

```text
.
├── app/               # Source code utama aplikasi Next.js (Frontend & Backend)
├── docs/              # Dokumentasi lengkap hasil analisis, rancangan, dan testing
│   ├── 01-analisis-skalabilitas.md
│   ├── 02-erd-sql.md
│   ├── 03-dokumentasi-kode.md
│   ├── 04-laporan-debugging.md
│   ├── 05-hasil-profiling.md
│   ├── 06-unit-testing.md
│   └── 07-integrasi-testing.md
└── README.md
```

## Panduan Instalasi dan Menjalankan (Development)

Pastikan Anda telah menginstal **Node.js** (v18+) dan **PostgreSQL** di perangkat Anda.

1. **Clone Repositori**
   ```bash
   git clone https://github.com/fatidaprilian/smfutsalbnsp.git
   cd smfutsalbnsp/app
   ```

2. **Instalasi Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Buat file `.env` di dalam folder `app/` dan sesuaikan pengaturan koneksi database (PostgreSQL) Anda:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/smsc_db?schema=public"
   SESSION_SECRET="rahasia-super-aman-untuk-jwt"
   ```

4. **Inisialisasi Database (Migrasi & Seeding)**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   ```

5. **Jalankan Server Development**
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses melalui browser di alamat: `http://localhost:3000`

## Panduan Testing

Aplikasi ini dilengkapi dengan unit testing dan integrasi testing untuk menjamin kualitas kode (menghindari error saat reservasi).
Untuk menjalankan *test suite*, gunakan perintah:

```bash
cd app
npm run test
```

## Akun Demo (Seeder)

Jika Anda telah menjalankan langkah *seeder* (`npm run seed`), Anda bisa menggunakan akun berikut untuk masuk ke sistem:

**Akun Pelanggan (Customer):**
- **Email:** budi@email.com
- **Password:** password123

**Akun Administrator (Admin):**
- **Email:** admin@smsportcenter.com
- **Password:** admin123
