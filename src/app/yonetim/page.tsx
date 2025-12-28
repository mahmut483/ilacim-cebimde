"use client";

import { useAuth } from "@/context/AuthContext";
import { getAllPatients } from "@/actions/admin";
import { Users, Pill, Activity, Loader2, ArrowUp, ArrowDown, User, Clock, CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts";
import { Patient } from "@/types";
import Link from "next/link";

// Mock data generator for sparklines since we don't have historical usage logs yet
const generateSparklineData = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    day: i,
    value: Math.floor(Math.random() * 10) + 2
  }));
};

interface DashboardStats {
  totalPatients: number;
  totalMedicines: number;
  activePatients: number;
}

export default function YonetimPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalMedicines: 0,
    activePatients: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const patientsData = await getAllPatients();
        setPatients(patientsData);
        setStats({
          totalPatients: patientsData.length,
          totalMedicines: patientsData.reduce((acc, p) => acc + (p.medicineCount || 0), 0),
          activePatients: patientsData.length // Assuming active for now
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Toplam Hasta",
      value: stats.totalPatients,
      icon: Users,
      color: "bg-blue-600",
      trend: "+12%",
      trendUp: true,
      description: "Geçen aydan bu yana"
    },
    {
      title: "İlaç Takibi",
      value: stats.totalMedicines,
      icon: Pill,
      color: "bg-violet-600",
      trend: "+5%",
      trendUp: true,
      description: "Aktif ilaç sayısı"
    },
    {
      title: "Aktif Kullanım",
      value: stats.activePatients,
      icon: Activity,
      color: "bg-emerald-500",
      trend: "98%",
      trendUp: true,
      description: "Günlük katılım oranı"
    }
  ];

  return (
    <div className="space-y-8 p-1">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Genel Bakış</h1>
        <p className="mt-2 text-lg text-gray-500">
          Sistem durumunu ve hasta aktivitelerini buradan takip edebilirsiniz.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                  <h3 className="text-4xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`p-3.5 rounded-2xl ${stat.color} bg-opacity-10`}>
                  <Icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {stat.trendUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {stat.trend}
                </span>
                <span className="text-xs text-gray-400 font-medium">{stat.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Patient Activity Table */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Hasta İlaç Kullanım Grafiği</h2>
              <p className="text-sm text-gray-500">Son 7 günlük ilaç kullanım düzeni</p>
            </div>
            <Link href="/yonetim/hastalar" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Tümünü Gör
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase">
                <tr>
                   <th className="px-6 py-4">Hasta</th>
                   <th className="px-6 py-4">Son Durum</th>
                   <th className="px-6 py-4 w-48">Haftalık Aktivite</th>
                   <th className="px-6 py-4 text-right">İlaç Adedi</th>
                </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {patients.slice(0, 5).map((patient, i) => (
                   <tr key={patient.id} className="hover:bg-gray-50/30 transition-colors">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            i % 2 === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'
                          }`}>
                            {patient.displayName?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{patient.displayName}</p>
                            <p className="text-xs text-gray-500">{patient.email}</p>
                          </div>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          İlaç Alındı
                        </span>
                     </td>
                     <td className="px-6 py-4">
                        <div className="h-10 w-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={generateSparklineData()}>
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={i % 2 === 0 ? '#4f46e5' : '#9333ea'} 
                                strokeWidth={2} 
                                dot={false} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-right">
                       <span className="font-bold text-gray-900">{patient.medicineCount || 0}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
           <h2 className="text-lg font-bold text-gray-900 mb-1">Son Aktiviteler</h2>
           <p className="text-sm text-gray-500 mb-6">Sistemdeki son işlemler</p>
           
           <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:h-full before:w-[2px] before:bg-gray-100">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="relative flex gap-4">
                   <div className="absolute left-0 mt-1.5 h-7 w-7 rounded-full bg-white border-2 border-indigo-50 shadow-sm flex items-center justify-center z-10">
                      <div className="h-2 w-2 rounded-full bg-indigo-500" />
                   </div>
                   <div className="pl-6">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="font-bold">Ali Yılmaz</span> bir ilaç ekledi.
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {i * 15 + 2} dakika önce
                      </p>
                   </div>
                </div>
              ))}
               <div className="relative flex gap-4">
                   <div className="absolute left-0 mt-1.5 h-7 w-7 rounded-full bg-white border-2 border-emerald-50 shadow-sm flex items-center justify-center z-10">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                   </div>
                   <div className="pl-6">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="font-bold">Sistem</span> yedeklemesi tamamlandı.
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 1 saat önce
                      </p>
                   </div>
                </div>
           </div>
                      <button 
              onClick={() => setShowActivitiesModal(true)}
              className="w-full mt-8 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
               Tüm Aktiviteleri Gör
            </button>
        </div>
      </div>

      {/* All Activities Modal */}
      {showActivitiesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowActivitiesModal(false)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Tüm Aktiviteler</h3>
                <p className="text-sm text-gray-500">Sistemdeki tüm işlem geçmişi</p>
              </div>
              <button 
                onClick={() => setShowActivitiesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:h-full before:w-[2px] before:bg-gray-100">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="relative flex gap-4">
                     <div className={`absolute left-0 mt-1.5 h-7 w-7 rounded-full border-2 shadow-sm flex items-center justify-center z-10 ${
                       i % 5 === 0 ? 'bg-white border-emerald-50' : 'bg-white border-indigo-50'
                     }`}>
                        {i % 5 === 0 ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-indigo-500" />
                        )}
                     </div>
                     <div className="pl-6 flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-gray-900">
                            {i % 5 === 0 ? (
                              <span className="font-bold">Sistem</span>
                            ) : (
                               <span className="font-bold">Ali Yılmaz</span>
                            )} 
                            {i % 5 === 0 ? " yedeklemesi tamamlandı." : " bir ilaç ekledi."}
                          </p>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                             {i === 0 ? "2 dakika önce" : `${i * 15 + 2} dakika önce`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 
                          {new Date(Date.now() - (i * 15 + 2) * 60000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button 
                onClick={() => setShowActivitiesModal(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
