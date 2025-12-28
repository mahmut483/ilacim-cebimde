"use client";

import { useState } from "react";
import { setDoctorRole } from "@/actions/auth";

export default function SetupPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleGrant = async () => {
    const res = await setDoctorRole(email);
    if (res.success) {
      setMsg(res.message || "Success");
    } else {
      setMsg(res.error || "Error");
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Admin Yetkisi Tanımlama</h1>
      <input 
        className="border p-2 rounded mr-2"
        placeholder="Admin Email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
      />
      <button 
        onClick={handleGrant}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Yetki Ver
      </button>
      {msg && <p className="mt-4">{msg}</p>}
    </div>
  );
}
