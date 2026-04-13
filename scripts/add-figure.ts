import { adminDb, adminStorage } from "./firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

interface FigureInput {
  nameKo: string;
  nameEn: string;
  nameJa: string;
  imageSource: string; // 이미지 URL (다운로드 후 Storage에 업로드)
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  sourceUrl: string;
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download image: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function uploadToStorage(buffer: Buffer, fileName: string): Promise<string> {
  const file = adminStorage.file(`figures/${fileName}`);
  await file.save(buffer, { contentType: "image/jpeg" });
  await file.makePublic();
  return `https://storage.googleapis.com/${adminStorage.name}/figures/${fileName}`;
}

async function addFigure(input: FigureInput) {
  const now = Timestamp.now();
  const [year, month, day] = input.date.split("-").map(Number);
  const date = Timestamp.fromDate(new Date(year, month - 1, day));

  // 이미지 다운로드 → Storage 업로드
  const imageBuffer = await downloadImage(input.imageSource);
  const fileName = `${Date.now()}_${input.nameEn.replace(/\s+/g, "_").toLowerCase()}.jpg`;
  const imageUrl = await uploadToStorage(imageBuffer, fileName);

  // Firestore에 문서 추가
  const docRef = await adminDb.collection("figures").add({
    nameKo: input.nameKo,
    nameEn: input.nameEn,
    nameJa: input.nameJa,
    imageUrl,
    date,
    time: input.time || "00:00",
    sourceUrl: input.sourceUrl,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`Added figure: ${input.nameKo} (ID: ${docRef.id})`);
  return docRef.id;
}

// CLI 실행
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: npx tsx scripts/add-figure.ts '<JSON>'");
  console.log(`Example: npx tsx scripts/add-figure.ts '${JSON.stringify({
    nameKo: "피규어 이름",
    nameEn: "Figure Name",
    nameJa: "フィギュア名",
    imageSource: "https://example.com/image.jpg",
    date: "2026-04-15",
    time: "14:00",
    sourceUrl: "https://example.com",
  })}'`);
  process.exit(1);
}

const input: FigureInput = JSON.parse(args[0]);
addFigure(input).catch(console.error);
