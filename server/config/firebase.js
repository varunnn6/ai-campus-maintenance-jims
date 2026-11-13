import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

export const connectFirestore = async () => {
  if (getApps().length > 0) {
    db = getFirestore();
    return db;
  }

  let serviceAccount;

  // Priority 1: FIREBASE_SERVICE_ACCOUNT env variable (for Railway/cloud deployment)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('[Firestore] Using service account from environment variable.');
  } else {
    // Priority 2: Local serviceAccount.json file (for local development)
    const serviceAccountPath = path.join(__dirname, '../serviceAccount.json');
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(
        '[Firestore] No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT env variable ' +
        'or place serviceAccount.json at server/serviceAccount.json.'
      );
    }
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    console.log('[Firestore] Using service account from serviceAccount.json file.');
  }

  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });

  db = getFirestore();
  console.log(`[Firestore] Connected to Firebase project: ${serviceAccount.project_id}`);
  return db;
};

export const getDb = () => {
  if (!db) throw new Error('[Firestore] Database not initialized. Call connectFirestore() first.');
  return db;
};
