"use client";

import { useAuth } from "@/context/AuthContext";
import { getAllPatients } from "@/actions/admin";
import { Users, Pill, Activity, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";


export default function YonetimPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalMedicines: 0,
    activePatients: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const patients = await getAllPatients();
        setStats({
          totalPatients: patients.length,
          totalMedicines: patients.reduce((acc, p) => acc + (p.medicineCount || 0), 0),
          activePatients: patients.length // Assuming all are active for now
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Toplam Hasta",
      value: stats.totalPatients,
      icon: Users,
      color: "bg-blue-600",
      trend: "+12% geçen aydan"
    },
    {
      title: "Toplam İlaç Takibi",
      value: stats.totalMedicines,
      icon: Pill,
      color: "bg-indigo-600",
      trend: "+5% geçen aydan"
    },
    {
      title: "Aktif Kullanıcılar",
      value: stats.activePatients,
      icon: Activity,
      color: "bg-emerald-500",
      trend: "Stabil"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Genel Bakış</h1>
        <p className="text-slate-500">Sistem verilerine hızlı bir bakış</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                  {stat.trend}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                <Icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity or Charts could go here */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400">
        Detaylı istatistik grafikleri burada yer alacak.
      </div>
    </div>
  );
}
