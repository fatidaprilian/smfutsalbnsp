/**
 * Mengambil waktu saat ini sesuai dengan zona waktu yang dinamis (default: Asia/Jakarta).
 * Sangat berguna ketika dideploy ke Vercel Edge/Serverless yang menggunakan UTC secara default.
 */
export function getWIBDate(timezone: string = "Asia/Jakarta"): Date {
  const d = new Date();
  
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  
  const parts = formatter.formatToParts(d);
  let year = 0, month = 0, day = 0, hour = 0, minute = 0, second = 0;
  
  for (const part of parts) {
    if (part.type === "year") year = parseInt(part.value, 10);
    if (part.type === "month") month = parseInt(part.value, 10) - 1; // 0-indexed dalam Date
    if (part.type === "day") day = parseInt(part.value, 10);
    if (part.type === "hour") hour = parseInt(part.value, 10) % 24; // Mencegah 24 jadi error
    if (part.type === "minute") minute = parseInt(part.value, 10);
    if (part.type === "second") second = parseInt(part.value, 10);
  }
  
  // Membuat instance Date baru yang menganggap bagian waktu di atas 
  // sebagai waktu lokal mesin saat ini (meski mesinnya pakai UTC).
  // Saat .getHours() dipanggil di server Vercel (UTC),
  // ia akan mengembalikan angka jam sesuai dengan zona waktu yang diminta.
  return new Date(year, month, day, hour, minute, second);
}
