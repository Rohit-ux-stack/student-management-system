import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

let firebaseApp = null;
let storageBucket = null;

/**
 * Initializes and returns the Firebase Admin instance using environment variables.
 * Does not rely on hardcoded service account JSON files.
 */
export function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    firebaseApp = admin.app();
    return firebaseApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucketUrl = process.env.FIREBASE_STORAGE_BUCKET;

  if (privateKey) {
    // Handle escaped newlines in environment variable strings
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const isPlaceholderKey =
    !privateKey ||
    privateKey.includes('your-firebase') ||
    privateKey.includes('...');

  if (projectId && clientEmail && privateKey && !isPlaceholderKey) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: storageBucketUrl,
      });
      console.log('✅ Firebase Admin SDK initialized successfully.');
    } catch (error) {
      console.warn('⚠️  Could not initialize Firebase Admin SDK with provided credentials:', error.message);
    }
  } else {
    console.warn(
      'ℹ️  Firebase Storage credentials pending in .env. Photo uploads will be disabled until valid credentials are provided.'
    );
  }

  return firebaseApp;
}

/**
 * Returns the Firebase Cloud Storage bucket instance for student photo uploads.
 * @param {string} [customBucketName] - Optional custom bucket override
 * @returns {admin.storage.StorageBucket | null}
 */
export function getFirebaseStorageBucket(customBucketName) {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }

  if (!firebaseApp) {
    return null;
  }

  if (!storageBucket) {
    const bucketName = customBucketName || process.env.FIREBASE_STORAGE_BUCKET;
    storageBucket = admin.storage().bucket(bucketName);
  }

  return storageBucket;
}

// Auto-initialize on module load if environment variables are present
initializeFirebaseAdmin();

export { admin };
export default {
  admin,
  initializeFirebaseAdmin,
  getFirebaseStorageBucket,
};
