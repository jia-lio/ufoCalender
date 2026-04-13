import { Timestamp } from "firebase/firestore";

export interface Figure {
  id: string;
  nameKo: string;
  nameEn: string;
  nameJa: string;
  imageUrl: string;
  date: Timestamp;
  time: string; // HH:mm
  sourceUrl: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CalendarDay {
  date: Date;
  figures: Figure[];
  isCurrentMonth: boolean;
}
