"use client";

import { useEffect, useState } from "react";
import { 
  getPatientMedicines, 
  addMedicine, 
  updateMedicine, 
  deleteMedicine 
} from "@/actions/admin";
import { Medicine } from "@/types";
import { 
  ArrowLeft, 
  Plus, 
  Clock, 
  Trash2, 
  Edit2, 
  Pill, 
  Loader2,
  X,
  MinusCircle
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function HastaDetayPage() {
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicineFormOpen, setMedicineFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: "",
    dose: "",
    times: [""],
    totalQuantity: 0,
    remainingQuantity: 0,
    instructions: "",
    active: true
  });

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function fetchData() {
    try {
      setLoading(true);
      const meds = await getPatientMedicines(userId);
      setMedicines(meds);
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
      times: med.times && med.times.length > 0 ? med.times : [""]
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
      // Filter out empty times
      const cleanData = {
        ...formData,
        times: formData.times?.filter(t => t.trim() !== "") || []
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
      times: [""], 
      totalQuantity: 0, 
      remainingQuantity: 0, 
      instructions: "", 
      active: true 
    });
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...(formData.times || [])];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const addTimeSlot = () => {
    setFormData({ ...formData, times: [...(formData.times || []), ""] });
  };

  const removeTimeSlot = (index: number) => {
    const newTimes = [...(formData.times || [])];
    newTimes.splice(index, 1);
    setFormData({ ...formData, times: newTimes });
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

      {/* Medicines Section */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {med.times && med.times.length > 0 
                        ? med.times.join(", ") 
                        : "Saat girilmemiş"}
                    </span>
                  </div>
                  {med.instructions && (
                    <div className="bg-slate-50 p-2 rounded-lg text-xs mt-2">
                      {med.instructions}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Örn: Parol"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Doz (mg, ml vb.)</label>
                <input 
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    value={formData.totalQuantity}
                    onChange={e => setFormData({...formData, totalQuantity: Number(e.target.value)})}
                  />
                 </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kalan Adet</label>
                  <input 
                    type="number"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    value={formData.remainingQuantity}
                    onChange={e => setFormData({...formData, remainingQuantity: Number(e.target.value)})}
                  />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Saatler</label>
                <div className="space-y-2">
                  {formData.times?.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input 
                        type="time"
                        required
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        value={time}
                        onChange={e => handleTimeChange(index, e.target.value)}
                      />
                      {index > 0 && (
                        <button 
                          type="button" 
                          onClick={() => removeTimeSlot(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <MinusCircle className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={addTimeSlot}
                    className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Saat Ekle
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Talimatlar</label>
                <textarea 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none h-24 resize-none"
                  value={formData.instructions}
                  onChange={e => setFormData({...formData, instructions: e.target.value})}
                  placeholder="Örn: Tok karnına bol su ile"
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
