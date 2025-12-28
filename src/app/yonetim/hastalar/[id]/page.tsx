"use client";

import { useEffect, useState } from "react";
import { 
  getPatientMedicines, 
  addMedicine, 
  updateMedicine, 
  deleteMedicine,
  getPatientIntakes
} from "@/actions/admin";
import { Medicine, Intake } from "@/types";
import { 
  ArrowLeft, 
  Plus, 
  Clock,
  Trash2, 
  Edit2, 
  Pill, 
  Loader2,
  X,
  History,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Local form type to handle number inputs as strings to allow empty values
interface MedicineFormData extends Omit<Medicine, "id" | "totalQuantity" | "remainingQuantity"> {
  totalQuantity: string | number;
  remainingQuantity: string | number;
}

export default function HastaDetayPage() {
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [medicineFormOpen, setMedicineFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form State
  const [formData, setFormData] = useState<MedicineFormData>({
    name: "",
    dose: "",
    time: "",
    totalQuantity: "", // Initialize as empty string
    remainingQuantity: "", // Initialize as empty string
    instructions: "",
    doctorNote: "",
    hungerStatus: "Tok Karnına",
    active: true
  });

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function fetchData() {
    try {
      setLoading(true);
      const [meds, intakeHistory] = await Promise.all([
        getPatientMedicines(userId),
        getPatientIntakes(userId)
      ]);
      setMedicines(meds);
      setIntakes(intakeHistory);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setFormData({
      ...med,
      time: med.time || "",
      // Ensure these are passed as is (numbers) or strings if needed
      totalQuantity: med.totalQuantity,
      remainingQuantity: med.remainingQuantity,
      doctorNote: med.doctorNote || "",
      hungerStatus: med.hungerStatus || "Tok Karnına"
    });
    setMedicineFormOpen(true);
  };

  const handleDelete = async (medId: string) => {
    if (!confirm("Bu ilacı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteMedicine(userId, medId);
      fetchData(); // Refresh
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Filter out empty times and convert numbers
      const cleanData: Partial<Medicine> = {
        name: formData.name,
        dose: formData.dose,
        instructions: formData.instructions,
        doctorNote: formData.doctorNote,
        hungerStatus: formData.hungerStatus,
        active: formData.active,
        time: formData.time,
        totalQuantity: Number(formData.totalQuantity),
        remainingQuantity: Number(formData.remainingQuantity)
      };

      if (editingMedicine) {
        await updateMedicine(userId, editingMedicine.id, cleanData);
      } else {
        await addMedicine(userId, cleanData as Omit<Medicine, "id">);
      }
      setMedicineFormOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Save Error:", error);
      alert("Hata oluştu.");
    }
  };

  const resetForm = () => {
    setEditingMedicine(null);
    setFormData({ 
      name: "", 
      dose: "", 
      time: "", 
      totalQuantity: "", 
      remainingQuantity: "", 
      instructions: "",
      doctorNote: "",
      hungerStatus: "Tok Karnına",
      active: true
    });
  };



  // Helper to find medicine name by ID
  const getMedicineName = (id?: string) => {
    if (!id) return "Bilinmeyen İlaç";
    const med = medicines.find(m => m.id === id);
    return med ? med.name : id; // Return ID if name not found, or maybe just "Silinmiş İlaç"
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/yonetim/hastalar" 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Hasta Detayı</h1>
            <p className="text-slate-500">İlaç takibi ve yönetimi</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column: Medicines Section */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-800">Kullanılan İlaçlar</h2>
              </div>
              <button 
                onClick={() => {
                  resetForm();
                  setMedicineFormOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                İlaç Ekle
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : medicines.length === 0 ? (
              <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                Henüz ilaç eklenmemiş.
              </div>
            ) : (
              <div className="space-y-4">
                {medicines.map((med) => (
                  <div key={med.id} className="p-4 border border-slate-200 rounded-xl hover:border-blue-200 transition-colors group relative bg-white">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(med)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(med.id)} className="p-1.5 hover:bg-red-50 rounded-md text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <Pill className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{med.name}</h3>
                        <p className="text-sm text-slate-500">{med.dose}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>Stok: {med.remainingQuantity} / {med.totalQuantity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>
                          {med.time || "Saat girilmemiş"}
                        </span>
                      </div>
                      {med.doctorNote && (
                         <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 mt-2">
                            <span className="font-semibold text-xs whitespace-nowrap mt-0.5">Doktor Notu:</span>
                            <span className="break-words break-all text-sm">{med.doctorNote}</span>
                         </div>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                         <div className="flex items-center gap-2">
                           {med.hungerStatus === "Aç Karnına" ? (
                             <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-rose-50 text-rose-700">Aç Karnına</span>
                           ) : (
                             <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700">Tok Karnına</span>
                           )}
                         </div>
                         {med.instructions && (
                           <div className="text-slate-500 italic max-w-xs truncate">
                             {med.instructions}
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Intake History Section */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full">
            <div className="flex items-center gap-2 mb-6">
              <History className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-800">İlaç Geçmişi</h2>
            </div>
            
            {loading ? (
               <div className="flex justify-center p-8">
                 <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
               </div>
            ) : intakes.length === 0 ? (
               <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                 Henüz ilaç kullanım kaydı yok.
               </div>
            ) : (
               <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="relative border-l border-slate-100 ml-3 space-y-4 pt-2">
                    {intakes.map((intake) => (
                      <div key={intake.id} className="ml-6 relative">
                        <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                          <div className="flex justify-between items-start">
                             <div>
                               <p className="font-semibold text-slate-800 text-sm">
                                  {getMedicineName(intake.medicineId)}
                               </p>
                               <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                  İlaç alındı
                               </span>
                             </div>
                             <div className="text-right">
                                <span className="text-xs font-medium text-slate-400 bg-white border border-slate-100 px-2 py-1 rounded-md">
                                   {intake.takenAt || "Bilinmiyor"}
                                </span>
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal/Form */}
      {medicineFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingMedicine ? "İlacı Düzenle" : "Yeni İlaç Ekle"}
              </h3>
              <button onClick={() => setMedicineFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">İlaç Adı</label>
                <input 
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 placeholder:text-gray-400"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Örn: Parol"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Doz (mg, ml vb.)</label>
                <input 
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 placeholder:text-gray-400"
                  value={formData.dose}
                  onChange={e => setFormData({...formData, dose: e.target.value})}
                  placeholder="Örn: 500mg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Toplam Adet</label>
                  <input 
                    type="number"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 placeholder:text-gray-400"
                    value={formData.totalQuantity}
                    onChange={e => setFormData({...formData, totalQuantity: e.target.value})}
                  />
                 </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kalan Adet</label>
                  <input 
                    type="number"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 placeholder:text-gray-400"
                    value={formData.remainingQuantity}
                    onChange={e => setFormData({...formData, remainingQuantity: e.target.value})}
                  />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Saat</label>
                <input 
                  type="time"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 placeholder:text-gray-400"
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                />
              </div>

              {/* Hunger Status Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kullanım Durumu</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`
                    border rounded-xl p-3 flex items-center justify-center cursor-pointer transition-all
                    ${formData.hungerStatus === "Tok Karnına" 
                      ? "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}
                  `}>
                    <input 
                      type="radio" 
                      name="hungerStatus" 
                      value="Tok Karnına"
                      checked={formData.hungerStatus === "Tok Karnına"}
                      onChange={e => setFormData({...formData, hungerStatus: e.target.value})}
                      className="sr-only"
                    />
                    <span className="font-medium">Tok Karnına</span>
                  </label>
                  
                  <label className={`
                    border rounded-xl p-3 flex items-center justify-center cursor-pointer transition-all
                    ${formData.hungerStatus === "Aç Karnına" 
                      ? "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}
                  `}>
                    <input 
                      type="radio" 
                      name="hungerStatus" 
                      value="Aç Karnına"
                      checked={formData.hungerStatus === "Aç Karnına"}
                      onChange={e => setFormData({...formData, hungerStatus: e.target.value})}
                      className="sr-only"
                    />
                    <span className="font-medium">Aç Karnına</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Doktor Notu</label>
                <textarea 
                  className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none h-20 resize-none text-slate-800 placeholder:text-amber-300"
                  value={formData.doctorNote}
                  maxLength={150}
                  onChange={e => setFormData({...formData, doctorNote: e.target.value})}
                  placeholder="Örn: İlacı alırken baş dönmesi yapabilir..."
                />
                <div className="text-xs text-slate-400 text-right mt-1">
                  {(formData.doctorNote?.length || 0)}/150
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Talimatlar</label>
                <textarea 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none h-24 resize-none text-gray-900 placeholder:text-gray-400"
                  value={formData.instructions}
                  onChange={e => setFormData({...formData, instructions: e.target.value})}
                  placeholder="Örn: Bol su ile yutunuz."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setMedicineFormOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium shadow-lg shadow-blue-600/20"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
