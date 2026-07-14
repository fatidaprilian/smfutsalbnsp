# Dokumen Unit Testing
## Sistem Reservasi Lapangan — SM Sport Center

---

## 1. Framework dan Konfigurasi

- **Framework:** Vitest 4.x
- **Environment:** Node.js
- **Perintah:** `npm test` atau `npx vitest run`

## 2. Data Uji

### Auth Test Data

| Data | Nilai |
|---|---|
| Password benar | `password123` |
| Password salah | `wrongpassword` |
| Hash (bcrypt, cost 10) | Dihasilkan oleh `hashSync("password123", 10)` |

### Reservation Test Data

| Data | Nilai |
|---|---|
| Reservasi existing #1 | Jam 08:00–10:00, CONFIRMED |
| Reservasi existing #2 | Jam 14:00–16:00, CONFIRMED |
| Reservasi existing #3 | Jam 18:00–19:00, CANCELLED |
| Price per hour | Rp200.000 |

## 3. Skenario dan Hasil

### 3.1 Auth Logic Test

| No | Skenario | Input | Expected | Actual | Status |
|---|---|---|---|---|---|
| 1 | Login email + password benar | password: `password123`, hash: valid bcrypt | `true` (berhasil masuk) | `true` | PASS |
| 2 | Login password salah | password: `wrongpassword`, hash: valid bcrypt | `false` (pesan error) | `false` | PASS |

### 3.2 Reservation Logic Test

| No | Skenario | Input | Expected | Actual | Status |
|---|---|---|---|---|---|
| 3 | Reservasi valid (slot kosong) | Jam 10:00–12:00 | Tidak ada konflik → data tersimpan | `hasConflict = false` | PASS |
| 4 | Reservasi slot bentrok | Jam 09:00–11:00 (overlap dengan 08:00–10:00) | Konflik terdeteksi | `hasConflict = true` | PASS |
| 5 | Booking slot yang sudah di-cancel | Jam 18:00–19:00 (slot CANCELLED) | Tidak ada konflik | `hasConflict = false` | PASS |
| 6 | Overlap persis (exact match) | Jam 08:00–10:00 (sama dengan existing) | Konflik terdeteksi | `hasConflict = true` | PASS |
| 7 | Slot adjacent (bersebelahan) | Jam 10:00–14:00 (mulai tepat setelah 08:00–10:00) | Tidak ada konflik | `hasConflict = false` | PASS |
| 8 | Kalkulasi harga | 2 jam × Rp200.000 | Rp400.000 | `400000` | PASS |

## 4. Output Test

```
 ✓ src/__tests__/auth.test.ts (2 tests) 145ms
 ✓ src/__tests__/reservation.test.ts (6 tests) 4ms

 Test Files  2 passed (2)
      Tests  8 passed (8)
   Start at  14:55:14
   Duration  410ms
```

## 5. Kesimpulan

Semua 8 skenario pengujian berhasil (PASS). Pengujian mencakup:
- **Happy path:** Login benar, reservasi slot kosong
- **Error path:** Login salah, reservasi slot bentrok
- **Edge case:** Slot cancelled bisa di-booking ulang, slot adjacent tidak konflik
- **Kalkulasi:** Harga dihitung dengan benar
