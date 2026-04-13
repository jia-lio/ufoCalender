import { adminDb } from "./firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";

interface SyncFigureInput {
  nameKo: string;
  nameEn: string;
  nameJa: string;
  imageUrl: string; // 이미지 URL (직접 저장)
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  sourceUrl: string;
}

async function getExistingFigureNames(months: string[]): Promise<Set<string>> {
  const names = new Set<string>();

  for (const month of months) {
    const [year, mon] = month.split("-").map(Number);
    const start = Timestamp.fromDate(new Date(year, mon - 1, 1));
    const end = Timestamp.fromDate(new Date(year, mon, 1));

    const snapshot = await adminDb
      .collection("figures")
      .where("date", ">=", start)
      .where("date", "<", end)
      .get();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.nameJa) names.add(data.nameJa);
    });
  }

  return names;
}

function validateFigures(data: unknown): SyncFigureInput[] {
  if (!Array.isArray(data)) {
    throw new Error("Input must be a JSON array");
  }
  const required = ["nameKo", "nameEn", "nameJa", "imageUrl", "date", "sourceUrl"] as const;
  for (let i = 0; i < data.length; i++) {
    const fig = data[i];
    for (const field of required) {
      if (!fig[field] || typeof fig[field] !== "string") {
        throw new Error(`figures[${i}]: missing or invalid field "${field}"`);
      }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fig.date)) {
      throw new Error(`figures[${i}]: date must be YYYY-MM-DD format, got "${fig.date}"`);
    }
  }
  return data as SyncFigureInput[];
}

async function syncFigures(inputPath: string) {
  let raw: string;
  try {
    raw = readFileSync(inputPath, "utf-8");
  } catch {
    console.error(`Error: cannot read file "${inputPath}"`);
    process.exit(1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error(`Error: invalid JSON in "${inputPath}"`);
    process.exit(1);
  }

  let figures: SyncFigureInput[];
  try {
    figures = validateFigures(parsed);
  } catch (e) {
    console.error(`Validation error: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  }

  if (figures.length === 0) {
    console.log("No figures to sync.");
    return;
  }

  // 입력 데이터에서 관련 월 추출
  const months = new Set<string>();
  for (const fig of figures) {
    const [year, month] = fig.date.split("-");
    months.add(`${year}-${month}`);
  }

  console.log(`Checking ${figures.length} figures against DB...`);
  const existingNames = await getExistingFigureNames([...months]);
  console.log(`Found ${existingNames.size} existing figures in DB for months: ${[...months].join(", ")}`);

  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (const fig of figures) {
    if (existingNames.has(fig.nameJa)) {
      console.log(`  SKIP: ${fig.nameJa}`);
      skipped++;
      continue;
    }

    try {
      const now = Timestamp.now();
      const [year, month, day] = fig.date.split("-").map(Number);
      const date = Timestamp.fromDate(new Date(year, month - 1, day));

      // Firestore 추가 (이미지는 외부 URL 직접 저장 - import-april-2026.ts와 동일)
      await adminDb.collection("figures").add({
        nameKo: fig.nameKo,
        nameEn: fig.nameEn,
        nameJa: fig.nameJa,
        imageUrl: fig.imageUrl,
        date,
        time: fig.time || "00:00",
        sourceUrl: fig.sourceUrl,
        createdAt: now,
        updatedAt: now,
      });

      console.log(`  ADD:  ${fig.nameJa}`);
      added++;
    } catch (err) {
      console.error(`  FAIL: ${fig.nameJa} - ${err}`);
      failed++;
    }
  }

  console.log(`\nSync complete: ${added} added, ${skipped} skipped, ${failed} failed`);
}

// CLI
const filePath = process.argv[2];
if (!filePath) {
  console.log("Usage: npx tsx scripts/sync-figures.ts <path-to-json>");
  console.log("JSON format: [{ nameKo, nameEn, nameJa, imageUrl, date, time?, sourceUrl }]");
  process.exit(1);
}

syncFigures(filePath).catch(console.error);
