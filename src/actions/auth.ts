"use server";

import { adminAuth } from "@/libs/firebaseAdmin";

export async function setDoctorRole(email: string) {
  try {
    const user = await adminAuth.getUserByEmail(email);
    await adminAuth.setCustomUserClaims(user.uid, { doctor: true });
    return { success: true, message: `${email} kullanıcısına doktor yetkisi verildi.` };
  } catch (error) {
    console.error("Error setting doctor role:", error);
    return { success: false, error: "Yetki verilirken hata oluştu." };
  }
}

export async function checkDoctorRole(idToken: string) {
  try {
     const decodedToken = await adminAuth.verifyIdToken(idToken);
     return !!decodedToken.doctor;
  } catch (error) {
    console.error("Error checking doctor role:", error);
    return false;
  }
}
