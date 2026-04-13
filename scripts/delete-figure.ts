import { adminDb, adminStorage } from "./firebase-admin";

async function deleteFigure(figureId: string) {
  const docRef = adminDb.collection("figures").doc(figureId);
  const doc = await docRef.get();

  if (!doc.exists) {
    console.error(`Figure not found: ${figureId}`);
    process.exit(1);
  }

  const data = doc.data()!;

  // Storage에서 이미지 삭제
  if (data.imageUrl) {
    try {
      const path = new URL(data.imageUrl).pathname;
      const storagePath = decodeURIComponent(path.split("/o/")[1]?.split("?")[0] || path.replace(`/${adminStorage.name}/`, ""));
      await adminStorage.file(storagePath).delete();
      console.log(`Deleted image: ${storagePath}`);
    } catch (e) {
      console.warn(`Failed to delete image (continuing): ${e}`);
    }
  }

  // Firestore에서 문서 삭제
  await docRef.delete();
  console.log(`Deleted figure: ${data.nameKo} (ID: ${figureId})`);
}

const figureId = process.argv[2];
if (!figureId) {
  console.log("Usage: npx tsx scripts/delete-figure.ts <figureId>");
  process.exit(1);
}

deleteFigure(figureId).catch(console.error);
