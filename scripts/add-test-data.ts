import { adminDb } from "./firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

async function addTestData() {
  const figures = [
    {
      nameKo: "하츠네 미쿠 피규어",
      nameEn: "Hatsune Miku Figure",
      nameJa: "初音ミクフィギュア",
      imageUrl: "https://picsum.photos/seed/miku/400/500",
      date: Timestamp.fromDate(new Date(2026, 3, 7, 14, 0)), // 4월 7일 14시
      time: "14:00",
      sourceUrl: "https://example.com",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      nameKo: "원피스 루피 피규어",
      nameEn: "One Piece Luffy Figure",
      nameJa: "ワンピース ルフィフィギュア",
      imageUrl: "https://picsum.photos/seed/luffy/400/500",
      date: Timestamp.fromDate(new Date(2026, 3, 7, 20, 0)), // 4월 7일 20시
      time: "20:00",
      sourceUrl: "https://example.com",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      nameKo: "드래곤볼 손오공 피규어",
      nameEn: "Dragon Ball Goku Figure",
      nameJa: "ドラゴンボール 悟空フィギュア",
      imageUrl: "https://picsum.photos/seed/goku/400/500",
      date: Timestamp.fromDate(new Date(2026, 3, 10, 0, 0)), // 4월 10일 00시
      time: "00:00",
      sourceUrl: "https://example.com",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  ];

  for (const figure of figures) {
    const docRef = await adminDb.collection("figures").add(figure);
    console.log(`Added: ${figure.nameKo} (ID: ${docRef.id})`);
  }

  console.log("Done! Added 3 test figures.");
}

addTestData().catch(console.error);
