import { db } from "@/libs/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc
} from "firebase/firestore";
import { Patient, Medicine } from "@/types";

// NOTE: Since Firebase Client SDK cannot list all users from Auth,
// we assume there is a 'users' collection in Firestore where we store user profiles.
// If this doesn't exist, we'll need to create it on user signup.

const USERS_COLLECTION = "users";
const MEDICINES_COLLECTION = "medicines"; // Subcollection of user

export const AdminService = {
  // Fetch all patients
  getAllPatients: async (): Promise<Patient[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
      const patients: Patient[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        patients.push({
          id: doc.id,
          email: data.email || "",
          displayName: data.displayName || "İsimsiz Hasta",
          phoneNumber: data.phoneNumber,
          age: data.age,
          createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
          medicineCount: data.medicineCount || 0
        });
      });
      
      return patients;
    } catch (error) {
      console.error("Error fetching patients:", error);
      throw error;
    }
  },

  // Fetch medicines for a specific patient
  getPatientMedicines: async (userId: string): Promise<Medicine[]> => {
    try {
      const medsRef = collection(db, USERS_COLLECTION, userId, MEDICINES_COLLECTION);
      const querySnapshot = await getDocs(medsRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Medicine));
    } catch (error) {
      console.error("Error fetching medicines:", error);
      throw error;
    }
  },

  // Add new medicine
  addMedicine: async (userId: string, medicine: Omit<Medicine, "id">) => {
    try {
      const medsRef = collection(db, USERS_COLLECTION, userId, MEDICINES_COLLECTION);
      await addDoc(medsRef, medicine);
    } catch (error) {
      console.error("Error adding medicine:", error);
      throw error;
    }
  },

  // Update medicine
  updateMedicine: async (userId: string, medicineId: string, updates: Partial<Medicine>) => {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId, MEDICINES_COLLECTION, medicineId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("Error updating medicine:", error);
      throw error;
    }
  },

  // Delete medicine
  deleteMedicine: async (userId: string, medicineId: string) => {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId, MEDICINES_COLLECTION, medicineId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting medicine:", error);
      throw error;
    }
  }
};
