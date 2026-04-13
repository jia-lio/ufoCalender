import { adminDb } from "./firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

async function listFigures(month?: string) {
  let query = adminDb.collection("figures").orderBy("date", "asc");

  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const start = Timestamp.fromDate(new Date(year, mon - 1, 1));
    const end = Timestamp.fromDate(new Date(year, mon, 1));
    query = query.where("date", ">=", start).where("date", "<", end);
  }

  const snapshot = await query.get();

  if (snapshot.empty) {
    console.log("No figures found.");
    return;
  }

  console.log(`Found ${snapshot.size} figure(s):\n`);
  snapshot.forEach((doc) => {
    const d = doc.data();
    const date = (d.date as Timestamp).toDate();
    console.log(`[${doc.id}] ${d.nameKo} | ${date.toISOString().split("T")[0]} ${d.time} | ${d.sourceUrl}`);
  });
}

const monthArg = process.argv.find((a) => a.startsWith("--month="))?.split("=")[1]
  || (process.argv.indexOf("--month") !== -1 ? process.argv[process.argv.indexOf("--month") + 1] : undefined);

listFigures(monthArg).catch(console.error);
