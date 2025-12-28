"use server";

import { adminDb } from "@/libs/firebaseAdmin";
import { Medicine, Patient, Intake } from "@/types";
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
    console.log(`[Admin] Fetched ${snapshot.size} users from ${USERS_COLLECTION}`);
    
    const patients: Patient[] = snapshot.docs.map(doc => {
      const data = doc.data();
      const name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
      
      return {
        id: doc.id,
        email: data.email || "",
        displayName: name || data.displayName || "İsimsiz Hasta",
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

export async function getPatientIntakes(userId: string): Promise<Intake[]> {
  try {
    const snapshot = await adminDb
      .collection(USERS_COLLECTION)
      .doc(userId)
      .collection("intakes")
      .orderBy("__name__", "desc") // Order by ID since it contains date, most recent first
      .limit(50)
      .get();

    const intakes = snapshot.docs.map(doc => {
      // Parse ID format: medicineId_YYYY-MM-DD_HH:mm
      // Example: UmHoRqYDPQekYEJhdoX3_2025-12-28_05:40
      const parts = doc.id.split('_');
      // If valid format
      if (parts.length >= 3) {
        const medicineId = parts[0];
        const dateStr = parts[1];
        const timeStr = parts.slice(2).join(':'); // Handle case where time might be split incorrectly if it hadn't used simple split
        return {
          id: doc.id,
          medicineId: medicineId,
          timestamp: `${dateStr}T${timeStr}:00`,
          takenAt: `${dateStr} ${timeStr}`,
          status: "taken"
        } as Intake;
      }
      
      // Fallback for other formats
      return {
        id: doc.id,
        takenAt: "Bilinmeyen Tarih",
        status: "taken"
      } as Intake;
    });

    return serialize(intakes);
  } catch (error) {
    console.error("Server Action Error (getPatientIntakes):", error);
    return []; // Return empty array instead of throwing to avoid breaking the page
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
