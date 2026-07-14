import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAvailableSlots } from "@/actions/reservation";

// Cache halaman ini selama 60 detik (ISR). Mencegah database kelebihan beban jika banyak pengunjung.
export const revalidate = 60;

export default async function Home() {
  const session = await getSession();
  
  if (session) {
    if (session.role === "ADMIN") redirect("/admin/reservations");
    redirect("/reservations");
  }

  // Ambil ketersediaan hari ini
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split("T")[0];
  const courts = await getAvailableSlots(todayStr);

  // Format tanggal untuk tampilan (misal: 14 Juli 2026)
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(todayDate);

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 sm:pt-24 sm:pb-20">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Cara Modern untuk <br/>
            <span className="text-blue-600">Reservasi Lapangan</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Sistem reservasi lapangan futsal dan badminton SM Sport Center yang cepat, mudah, dan anti bentrok jadwal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </div>

      {/* Preview Ketersediaan Hari Ini */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Jadwal Lapangan Hari Ini</h2>
          <p className="text-slate-500 mt-2 font-medium">{formattedDate}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => {
            // Hitung slot tersedia vs total
            const totalSlots = court.slots.length;
            const availableSlots = court.slots.filter(s => s.available).length;
            
            return (
              <div key={court.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{court.name}</h3>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      {court.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-600">
                      Rp {court.pricePerHour.toLocaleString("id-ID")}<span className="font-normal text-slate-400">/jam</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 mt-2">
                  <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2 mb-4">
                    {court.slots.map((s, idx) => (
                      <div 
                        key={idx} 
                        className={`text-center py-1.5 rounded text-xs font-semibold border ${
                          s.available 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                        }`}
                        title={s.available ? 'Tersedia' : 'Penuh'}
                      >
                        {String(s.hour).padStart(2, '0')}:00
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    {availableSlots === 0 
                      ? <span className="text-red-500">Penuh (Fully Booked)</span>
                      : <span className="text-emerald-600">{availableSlots} dari {totalSlots} slot tersedia</span>
                    }
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
