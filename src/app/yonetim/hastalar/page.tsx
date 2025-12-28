"use client";

import { useEffect, useState } from "react";
import { getAllPatients } from "@/actions/admin";
import { Patient } from "@/types";
import { Search, Plus, Loader2, User, Filter, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/libs/utils"; 

export default function HastalarPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchPatients() {
      try {
        const data = await getAllPatients();
        setPatients(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => 
    patient.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-1">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Hasta Yönetimi</h1>
          <p className="mt-2 text-gray-500 text-lg">
            Sisteme kayıtlı hastaların listesini görüntüleyin ve yönetin.
          </p>
        </div>
        
        <button className="group inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0">
          <Plus className="h-5 w-5" />
          <span>Yeni Hasta Ekle</span>
        </button>
      </div>

      {/* Stats / Filter Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Card */}
        <div className="lg:col-span-3 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="relative flex items-center h-full">
            <Search className="absolute left-4 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="İsim, e-posta veya ID ile arama yapın..."
              className="w-full h-14 pl-12 pr-4 bg-transparent text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
             {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 text-xs font-medium text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded-md transition-colors"
                >
                  TEMİZLE
                </button>
              )}
          </div>
        </div>

        {/* Filter Button (Placeholder for future) */}
        <button className="hidden lg:flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 font-medium h-[60px] rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
          <Filter className="h-5 w-5" />
          <span>Filtrele</span>
        </button>
      </div>

      {/* Main Content - Table */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xl shadow-gray-100/50">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-gray-400 font-medium animate-pulse">Veriler yükleniyor...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <User className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Hasta Bulunamadı</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Aradığınız kriterlere uygun kayıt bulunmuyor veya henüz hiç kayıt eklenmemiş.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-8 py-5">Hasta Bilgisi</th>
                  <th className="px-6 py-5">İletişim</th>
                  <th className="px-6 py-5">Kayıt Tarihi</th>
                  <th className="px-6 py-5 text-center">Durum</th>
                  <th className="px-8 py-5 text-right">Eylem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPatients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className="group hover:bg-indigo-50/30 transition-colors duration-200"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                          {patient.displayName?.[0]?.toUpperCase() || <User className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{patient.displayName || "İsimsiz"}</p>
                          <p className="text-xs text-indigo-500 font-medium mt-0.5">ID: {patient.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-gray-700">{patient.email}</p>
                      {patient.phoneNumber && (
                        <p className="text-xs text-gray-400 mt-1">{patient.phoneNumber}</p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex flex-col">
                        <span className="text-sm font-medium text-gray-600">{formatDate(patient.createdAt)}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Kayıt</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                         <span className="text-xs font-semibold text-emerald-700">Aktif</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link 
                        href={`/yonetim/hastalar/${patient.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-indigo-600 transition-all shadow-sm hover:shadow"
                      >
                        Detay
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Footer Pagination (Stylistic Placeholder) */}
        {!loading && filteredPatients.length > 0 && (
          <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Topam <span className="font-semibold text-gray-900">{filteredPatients.length}</span> kayıt gösteriliyor</p>
            {/* Pagination buttons could go here */}
          </div>
        )}
      </div>
    </div>
  );
}
