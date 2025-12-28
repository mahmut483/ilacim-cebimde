export interface Medicine {
  id: string;
  name: string;
  dose: string;
  times: string[]; // e.g., ["09:00", "21:00"]
  totalQuantity: number;
  remainingQuantity: number;
  audioPath?: string | null;
  createdAt?: string;
  instructions?: string;
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
