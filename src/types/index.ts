export interface Medicine {
  id: string;
  name: string;
  dose: string;
  time: string; // e.g., "09:00"
  totalQuantity: number;
  remainingQuantity: number;
  audioPath?: string | null;
  createdAt?: string;
  instructions?: string;
  doctorNote?: string;
  hungerStatus?: "Tok Karnına" | "Aç Karnına" | string;
  active?: boolean;
}

export interface Patient {
  id: string; // Firebase UID
  email: string;
  displayName?: string;
  phoneNumber?: string;
  age?: number;
  gender?: string;
  createdAt: string;
  medicineCount?: number; // Calculated field for dashboard
}

export interface Intake {
  id: string; // Document ID (usually medicineId_date_time)
  medicineId?: string;
  medicineName?: string;
  takenAt?: string; // ISO string
  status?: "taken" | "skipped" | "missed";
  timestamp?: string; // Original timestamp from ID if needed
}
