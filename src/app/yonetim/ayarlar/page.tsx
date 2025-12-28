"use client";

import { useAuth } from "@/context/AuthContext";
import { updateProfile, updatePassword } from "firebase/auth";
import { useState } from "react";
import { Save, Loader2, User, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { auth } from "@/libs/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/libs/firebase";

export default function AyarlarPage() {
  const { user } = useAuth();
  
  const [name, setName] = useState(user?.displayName || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (auth.currentUser) {
        // Update Auth Profile
        await updateProfile(auth.currentUser, {
          displayName: name
        });

        // Update Firestore Document
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          displayName: name
        });

        // Update Password if provided
        if (password) {
          if (password !== confirmPassword) {
            throw new Error("Şifreler eşleşmiyor");
          }
          if (password.length < 6) {
             throw new Error("Şifre en az 6 karakter olmalı");
          }
          await updatePassword(auth.currentUser, password);
        }

        setSuccess("Profil başarıyla güncellendi.");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        if (err.message === "Requires recent login") {
          setError("Güvenlik nedeniyle şifre değiştirmek için yeniden giriş yapmalısınız.");
        } else {
          setError(err.message || "Güncelleme sırasında bir hata oluştu.");
        }
      } else {
        setError("Bilinmeyen bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Ayarlar</h1>
        <p className="text-slate-500">Profil bilgilerinizi ve hesap ayarlarınızı yönetin</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900">Profil Bilgileri</h2>
        </div>
        
        <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
          {/* Messages */}
          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Görünen İsim</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Adınız Soyadınız"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">E-posta Adresi</label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-400">E-posta adresi değiştirilemez.</p>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Şifre Değiştir</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Yeni Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Şifre Tekrar</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Değişiklikleri Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
