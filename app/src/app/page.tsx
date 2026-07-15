import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAvailableSlots } from "@/actions/reservation";
import { getWIBDate } from "@/lib/time";

// Cache halaman ini selama 60 detik (ISR)
export const revalidate = 60;

export default async function Home() {
  const session = await getSession();
  
  if (session) {
    if (session.role === "ADMIN") redirect("/admin/reservations");
    redirect("/reservations");
  }

  const todayDate = getWIBDate();
  const todayStr = todayDate.toISOString().split("T")[0];
  const courts = await getAvailableSlots(todayStr);

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(todayDate);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 lg:mt-12 mb-20">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
        
        {/* Left Column - Copywriting */}
        <div className="lg:col-span-5 flex flex-col justify-center pt-8 lg:pt-16 lg:sticky lg:top-32">
          <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold text-zinc-950 tracking-tighter leading-[1.1] mb-6">
            Sistem Reservasi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500">SM Sport Center.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed mb-10 max-w-lg font-medium">
            Fasilitas pemesanan lapangan futsal dan badminton yang terintegrasi secara profesional, cepat, dan transparan untuk kenyamanan Anda.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="group flex items-center justify-center px-8 py-4 bg-[#CCFF00] hover:bg-[#B8E600] text-zinc-950 font-bold text-lg rounded-xl transition-all duration-200 shadow-sm active:scale-[0.98]"
            >
              Mulai Sekarang
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center px-8 py-4 bg-white text-zinc-900 hover:bg-zinc-50 border-2 border-zinc-200 font-bold text-lg rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              Masuk
            </Link>
          </div>
        </div>

        {/* Right Column - Live Availability Cards */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Ketersediaan Hari Ini</h2>
              <p className="text-zinc-500 font-medium mt-1">{formattedDate}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {courts.map((court) => {
              const currentHour = getWIBDate().getHours();
              const validSlots = court.slots.map(s => ({
                ...s,
                isPast: s.hour <= currentHour,
                effectivelyAvailable: s.available && s.hour > currentHour
              }));

              const totalSlots = validSlots.length;
              const availableSlots = validSlots.filter(s => s.effectivelyAvailable).length;
              
              return (
                <div key={court.id} className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-zinc-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="font-bold text-xl text-zinc-900 tracking-tight">{court.name}</h3>
                      <span className="inline-block mt-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-widest uppercase bg-zinc-100 text-zinc-600">
                        {court.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-900">
                        Rp {court.pricePerHour.toLocaleString("id-ID")}
                      </p>
                      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">/ Jam</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {validSlots.map((s, idx) => (
                        <div 
                          key={idx} 
                          className={`text-center py-2 rounded-lg text-xs font-bold border transition-colors ${
                            s.effectivelyAvailable 
                              ? 'bg-white border-zinc-200 text-zinc-900 hover:border-zinc-900 cursor-default' 
                              : 'bg-zinc-50 border-transparent text-zinc-400 line-through'
                          }`}
                          title={s.effectivelyAvailable ? 'Tersedia' : s.isPast ? 'Lewat' : 'Penuh'}
                        >
                          {String(s.hour).padStart(2, '0')}:00
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-zinc-100">
                      <p className="text-sm font-semibold">
                        {availableSlots === 0 
                          ? <span className="text-red-500">Fully Booked</span>
                          : <span className="text-zinc-600"><span className="text-zinc-900">{availableSlots}</span> slot kosong</span>
                        }
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
