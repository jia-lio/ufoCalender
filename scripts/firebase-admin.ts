import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { readFileSync } from "fs";
import { resolve } from "path";

const serviceAccountPath = resolve(
  process.env.GOOGLE_APPLICATION_CREDENTIALS || "./serviceAccountKey.json"
);

if (getApps().length === 0) {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: "ufocalender.firebasestorage.app",
  });
}

export const adminDb = getFirestore();
export const adminStorage = getStorage().bucket();
