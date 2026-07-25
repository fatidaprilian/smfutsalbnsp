# Laporan Debugging
## Sistem Reservasi Lapangan — SM Sport Center

---

## 1. Laporan Insiden: Pesanan Ganda pada Jadwal yang Sama (Bug 1 - *Double Booking*)

### 1.1 Ringkasan Eksekutif (*Executive Summary*)
Saat melakukan pengujian, saya menemukan insiden di mana dua pelanggan berhasil memesan dan menyimpan jadwal lapangan yang sama persis di waktu yang bersamaan (*double booking*). Insiden ini kritis karena dapat mencederai kepercayaan pelanggan dan menimbulkan kebingungan operasional di lapangan. Saya menyadari bahwa akar masalahnya terletak pada pengaturan transaksi *database* standar yang kurang ketat dalam menangani akses serentak (*concurrency*). Oleh karena itu, saya mengatasi masalah ini dengan meningkatkan level isolasi transaksi ke tingkat paling ketat (*Serializable*) dan menambahkan mekanisme coba-ulang otomatis di kode sumber.

### 1.2 Kronologi (*Timeline*)
- **[Laporan Masuk]** Saya menemukan kasus di mana jadwal yang sama pada lapangan yang sama diklaim oleh dua pengguna berbeda. Keduanya memiliki status reservasi yang sah di sistem.
- **[Investigasi Mulai]** Melalui pengujian manual, saya membuktikan bahwa jika dua pengguna menekan tombol "Reservasi" secara hampir bersamaan (hanya beda sepersekian detik), sistem akan mengesahkan keduanya.
- **[Penemuan Akar Masalah]** Dari hasil analisis saya pada lapisan *database*, terlihat bahwa blok transaksi menggunakan pengaturan standar (*Read Committed*), yang mengizinkan proses B untuk membaca ketersediaan jadwal sementara proses A masih dalam tahap menyimpan.
- **[Resolusi]** Saya mengubah pengaturan isolasi *database* menjadi *Serializable* dan melengkapi sistem dengan penangkap eror (*error handler*) untuk membatalkan dan mencoba ulang transaksi jika terjadi tabrakan. Saya kemudian mengujinya kembali dan terbukti berhasil memblokir pesanan ganda.

### 1.3 Analisis Akar Masalah (*Root Cause Analysis - RCA*)
Bug ini disebabkan oleh *race condition* (kondisi balapan) pada *database* tingkat transaksi:
1. **Pola Transaksi Standar:** Secara *default*, PostgreSQL menggunakan *Read Committed*. Artinya:
   - Transaksi A mengecek slot kosong (hasil: kosong).
   - Transaksi B (satu milidetik kemudian) juga mengecek slot kosong (hasil: kosong). Transaksi B tidak bisa melihat bahwa Transaksi A sedang memproses pemesanan karena A belum selesai melakukan komit.
   - Transaksi A menyimpan pesanan (berhasil).
   - Transaksi B menyimpan pesanan (berhasil).
2. **Dampak Sistemik:** Pola "cek-lalu-simpan" di dalam satu blok transaksi yang longgar adalah *anti-pattern* klasik dalam sistem reservasi. Ini bukan masalah spesifik dari logika aplikasi yang saya buat, melainkan bawaan dari konfigurasi transaksi *database* yang belum diperketat.

### 1.4 Tindakan Perbaikan & Pencegahan (*Action Items*)
1. **Memperketat Level Isolasi *Database* (Selesai):** 
   Fungsi `createReservation` dan `updateReservation` diubah untuk menjalankan blok transaksi Prisma dengan mode `Serializable`. Mode ini memaksa *database* memproses transaksi satu per satu secara berurutan. Jika ada transaksi yang mencoba memodifikasi data yang sama secara bersamaan, *database* akan otomatis membatalkan salah satunya.
   ```typescript
   await prisma.$transaction(
     async (tx) => { ... },
     { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
   );
   ```
2. **Menambahkan Sabuk Pengaman Coba-Ulang (Selesai):** 
   Karena *Serializable* membatalkan salah satu transaksi, pelanggan akan mendapatkan pesan *error* teknis dari *database* (kode `P2034`). Untuk mencegah hal ini, dibuat fungsi `withSerializableRetry` yang secara otomatis mencoba ulang transaksi hingga 3 kali di belakang layar. Jika setelah dicoba slotnya memang sudah terisi, sistem akan menampilkan pesan "Jadwal bentrok!" yang ramah pengguna.
   ```typescript
   // Ilustrasi waktu setelah perbaikan:
   // Transaksi A: |---CEK---SIMPAN---SELESAI---|
   // Transaksi B:    |---CEK---SIMPAN---DIBATALKAN (P2034)---COBA ULANG---CEK (Penuh)---TOLAK---|
   ```

---

## 6. Laporan Insiden: Reservasi Lunas Tetap Bisa Diedit (Bug 2)

### 6.1 Ringkasan Eksekutif (*Executive Summary*)
Saya menemukan kendala operasional di mana pelanggan yang sudah melakukan pembayaran lunas (FULL) masih bisa mengubah jadwal atau membatalkan pesanannya secara sepihak. Bug ini cukup krusial karena jadwal yang seharusnya sudah final bisa digeser sewaktu-waktu, yang berpotensi merugikan manajemen lapangan. Saya berhasil menyelesaikan masalah ini dengan memperbaiki logika penetapan status pasca-pembayaran dan memperkuat validasi di sisi server (backend) agar keamanannya tidak hanya bergantung pada antarmuka.

### 6.2 Kronologi (*Timeline*)
- **[Laporan Masuk]** Terdapat laporan adanya kejanggalan: reservasi yang berstatus lunas masih memunculkan tombol "Edit" dan "Batalkan", baik dari sisi admin maupun pelanggan.
- **[Investigasi Mulai]** Saat saya mengecek kode pada antarmuka (`ReservationList.tsx`), terlihat bahwa UI mengizinkan edit selama statusnya `CONFIRMED`.
- **[Penemuan Akar Masalah]** Setelah saya menelusurinya hingga ke backend (`reservation.ts`), ternyata simulasi *gateway* pembayaran yang saya buat sebelumnya selalu memberikan status `CONFIRMED` pukul rata untuk semua transaksi berhasil, meskipun itu pembayaran lunas.
- **[Resolusi]** Saya segera mengimplementasikan perbaikan kode, lalu memverifikasi bahwa upaya edit dan pembatalan otomatis ditolak oleh sistem untuk reservasi yang sudah lunas.

### 6.3 Analisis Akar Masalah (*Root Cause Analysis - RCA*)
Bug ini bukanlah kerusakan *database*, melainkan cacat logika (*logical flaw*) yang terjadi karena dua hal yang saya lewatkan sebelumnya:
1. **Logika *Gateway* yang Kurang Spesifik:** Fungsi `processWalletPayment` menetapkan status mutlak menjadi `CONFIRMED` untuk semua transaksi. Seharusnya, saya memisahkan logikanya: jika pelanggan membayar DP, maka statusnya `CONFIRMED`. Namun jika dibayar lunas (FULL), statusnya harus langsung melompat menjadi `COMPLETED`.
2. **Kelemahan Validasi *Server-Side*:** Sistem sebelumnya hanya "bersembunyi" di balik tombol UI. Meskipun tombol "Edit" disembunyikan di layar, fungsi `updateReservation` dan `cancelReservation` di backend ternyata masih bisa menerima modifikasi data asalkan penggunanya sesuai. Ini adalah sebuah celah (*vulnerability*) karena saya tidak menambahkan perlindungan terhadap status akhir (seperti `COMPLETED`).

### 6.4 Tindakan Perbaikan & Pencegahan (*Action Items*)
1. **Memisahkan Jalur Status Pembayaran (Selesai):** 
   Saya telah merevisi fungsi `processWalletPayment`. Sistem kini membaca kolom `paymentType`. Jika "FULL", status otomatis dikunci menjadi `COMPLETED`. Jika "DP", status tetap `CONFIRMED`.
   ```typescript
   // Perbaikan logika yang saya lakukan di processWalletPayment
   data: { status: existing.paymentType === "FULL" ? "COMPLETED" : "CONFIRMED" }
   ```
2. **Membangun Benteng di Sisi Server (Selesai):** 
   Saya juga menambahkan proteksi tambahan pada `updateReservation` dan `cancelReservation`. Kini, sekalipun ada pihak yang memanipulasi *request* dari luar antarmuka, server akan menolaknya dengan tegas jika reservasi sudah berstatus `COMPLETED` atau `CANCELLED`.
   ```typescript
   if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
     return { error: "Reservasi yang sudah selesai atau dibatalkan tidak dapat diubah" };
   }
   ```
