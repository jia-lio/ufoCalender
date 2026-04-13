import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Figure } from "@/types";

export async function getFiguresByMonth(
  year: number,
  month: number
): Promise<Figure[]> {
  const start = Timestamp.fromDate(new Date(year, month, 1));
  const end = Timestamp.fromDate(new Date(year, month + 1, 1));

  const q = query(
    collection(db, "figures"),
    where("date", ">=", start),
    where("date", "<", end),
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Figure[];
}
