// components/DeliveryBoy.tsx

"use client";
import Link from "next/link";

const DELIVERIES = [
  { id: "DEL-001", address: "12 Baker St, Dhaka", status: "Pending", time: "9:00 AM" },
  { id: "DEL-002", address: "55 Gulshan Ave, Dhaka", status: "On the way", time: "10:30 AM" },
  { id: "DEL-003", address: "77 Banani Rd, Dhaka", status: "Delivered", time: "8:15 AM" },
];

const DeliveryDashboard = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Delivery Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Your assigned deliveries for today</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Assigned", value: "3", color: "bg-blue-50 text-blue-700" },
            { label: "Delivered", value: "1", color: "bg-green-50 text-green-700" },
            { label: "Pending", value: "2", color: "bg-amber-50 text-amber-700" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center font-semibold`}>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs mt-0.5 opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Delivery list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-700">Today's Deliveries</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {DELIVERIES.map((d) => (
              <div key={d.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-sm mt-0.5">
                    📦
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{d.id}</p>
                    <p className="text-xs text-slate-400">{d.address}</p>
                    <p className="text-xs text-slate-400 mt-0.5">🕐 {d.time}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${d.status === "Delivered" ? "bg-green-50 text-green-600"
                    : d.status === "On the way" ? "bg-blue-50 text-blue-600"
                      : "bg-amber-50 text-amber-600"
                  }`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action links */}
        <div className="flex gap-3">
          <Link href="/delivery" className="flex-1 text-center px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95">
            All Deliveries
          </Link>
          <Link href="/delivery/history" className="flex-1 text-center px-4 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95">
            Delivery History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
