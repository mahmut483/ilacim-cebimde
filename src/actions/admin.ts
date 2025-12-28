"use server";

import { adminDb } from "@/libs/firebaseAdmin";
import { Medicine, Patient } from "@/types";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";

const USERS_COLLECTION = "users";
const MEDICINES_COLLECTION = "medicines";

// Helper to serialize Firestore timestamps to simple strings/numbers
const serialize = (data: unknown) => {
  return JSON.parse(JSON.stringify(data));
};

export async function getAllPatients(): Promise<Patient[]> {
  try {
    const snapshot = await adminDb.collection(USERS_COLLECTION).get();
    const patients: Patient[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || "",
        displayName: data.displayName || "İsimsiz Hasta",
        phoneNumber: data.phoneNumber,
        age: data.age,
        // Convert Timestamp to ISO string if needed
        createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(), 
        medicineCount: data.medicineCount || 0
      };
    });
    return serialize(patients);
  } catch (error) {
    console.error("Server Action Error (getAllPatients):", error);
    throw new Error("Hastalar getirilemedi.");
  }
}

export async function getPatientMedicines(userId: string): Promise<Medicine[]> {
  try {
    const snapshot = await adminDb
      .collection(USERS_COLLECTION)
      .doc(userId)
      .collection(MEDICINES_COLLECTION)
      .get();

    const meds = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Medicine[];

    return serialize(meds);
  } catch (error) {
    console.error("Server Action Error (getPatientMedicines):", error);
    throw new Error("İlaçlar getirilemedi.");
  }
}

export async function addMedicine(userId: string, medicine: Omit<Medicine, "id">) {
  try {
    await adminDb
      .collection(USERS_COLLECTION)
      .doc(userId)
      .collection(MEDICINES_COLLECTION)
      .add(medicine);

    // Increment medicine count on user doc (optional but good for stats)
    await adminDb.collection(USERS_COLLECTION).doc(userId).update({
      medicineCount: FieldValue.increment(1)
    });

    revalidatePath(`/yonetim/hastalar/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Server Action Error (addMedicine):", error);
    return { success: false, error: "İlaç eklenemedi." };
  }
}

export async function updateMedicine(userId: string, medicineId: string, updates: Partial<Medicine>) {
  try {
    await adminDb
      .collection(USERS_COLLECTION)
      .doc(userId)
      .collection(MEDICINES_COLLECTION)
      .doc(medicineId)
      .update(updates);
      
    revalidatePath(`/yonetim/hastalar/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Server Action Error (updateMedicine):", error);
    return { success: false, error: "İlaç güncellenemedi." };
  }
}

export async function deleteMedicine(userId: string, medicineId: string) {
  try {
    await adminDb
      .collection(USERS_COLLECTION)
      .doc(userId)
      .collection(MEDICINES_COLLECTION)
      .doc(medicineId)
      .delete();
    
    // Decrement stats
     await adminDb.collection(USERS_COLLECTION).doc(userId).update({
      medicineCount: FieldValue.increment(-1)
    });

    revalidatePath(`/yonetim/hastalar/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Server Action Error (deleteMedicine):", error);
    return { success: false, error: "İlaç silinemedi." };
  }
}
