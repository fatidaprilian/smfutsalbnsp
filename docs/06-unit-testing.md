# Dokumen Unit Testing
## Sistem Reservasi Lapangan — SM Sport Center

---

## 1. Alat dan Cara Menjalankan

- **Alat pengujian:** Vitest 4.x
- **Cara menjalankan:** ketik `npm test` atau `npx vitest run` di terminal

---

## 2. Data yang Digunakan untuk Pengujian

### Data untuk Pengujian Login

| Data | Nilai |
|---|---|
| Kata sandi yang benar | `password123` |
| Kata sandi yang salah | `wrongpassword` |
| Kata sandi terenkripsi (bcrypt) | Dibuat dari `hashSync("password123", 10)` |

### Data untuk Pengujian Reservasi

| Data | Nilai |
|---|---|
| Reservasi yang sudah ada #1 | Jam 08:00–10:00, status Aktif (CONFIRMED) |
| Reservasi yang sudah ada #2 | Jam 14:00–16:00, status Aktif (CONFIRMED) |
| Reservasi yang sudah ada #3 | Jam 18:00–19:00, status Dibatalkan (CANCELLED) |
| Harga sewa per jam | Rp200.000 |

---

## 3. Skenario dan Hasil Pengujian

### 3.1 Pengujian Login

| No | Skenario | Data Masuk | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| 1 | Login dengan email dan kata sandi yang benar | Kata sandi: `password123`, hash: valid | Berhasil masuk (`true`) | `true` | LULUS |
| 2 | Login dengan kata sandi yang salah | Kata sandi: `wrongpassword`, hash: valid | Gagal masuk (`false`) | `false` | LULUS |

### 3.2 Pengujian Reservasi

| No | Skenario | Data Masuk | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| 3 | Reservasi di slot yang masih kosong | Jam 10:00–12:00 | Tidak ada bentrok → data bisa disimpan | `adaBentrok = false` | LULUS |
| 4 | Reservasi di slot yang bertabrakan | Jam 09:00–11:00 (bertabrakan dengan 08:00–10:00) | Bentrok terdeteksi | `adaBentrok = true` | LULUS |
| 5 | Memesan slot yang sebelumnya dibatalkan | Jam 18:00–19:00 (slot dengan status CANCELLED) | Tidak ada bentrok (boleh dipesan ulang) | `adaBentrok = false` | LULUS |
| 6 | Memesan di jam yang persis sama | Jam 08:00–10:00 (sama persis dengan yang sudah ada) | Bentrok terdeteksi | `adaBentrok = true` | LULUS |
| 7 | Memesan slot yang bersebelahan | Jam 10:00–14:00 (langsung setelah 08:00–10:00) | Tidak ada bentrok | `adaBentrok = false` | LULUS |
| 8 | Kalkulasi total harga | Durasi 2 jam × Rp200.000 | Rp400.000 | `400000` | LULUS |

---

## 4. Output Hasil Pengujian

```
 ✓ src/__tests__/auth.test.ts (2 pengujian) 145ms
 ✓ src/__tests__/reservation.test.ts (6 pengujian) 4ms

 File Uji   2 lulus (2)
 Pengujian  8 lulus (8)
 Dimulai    14:55:14
 Durasi     410ms
```

---

## 5. Kesimpulan

Seluruh 8 skenario pengujian berhasil (LULUS). Pengujian mencakup:
- **Alur normal:** Login benar, reservasi di slot kosong
- **Alur kesalahan:** Login dengan kata sandi salah, reservasi di slot yang sudah terisi
- **Kasus batas:** Slot yang dibatalkan bisa dipesan kembali; slot yang bersebelahan tidak dianggap bentrok
- **Kalkulasi:** Harga dihitung dengan benar sesuai durasi
