import { adminDb } from "./firebase-admin";

async function deleteAll() {
  const snapshot = await adminDb.collection("figures").get();
  console.log(`Found ${snapshot.size} docs to delete`);
  for (const doc of snapshot.docs) {
    await doc.ref.delete();
    console.log(`Deleted: ${doc.id}`);
  }
  const check = await adminDb.collection("figures").get();
  console.log(`Remaining: ${check.size}`);
}

deleteAll().catch(console.error);
