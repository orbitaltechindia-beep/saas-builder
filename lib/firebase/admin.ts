import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      }),
    });
  } catch (error: any) {
    console.log('Firebase admin initialization error', error?.message);
  }
}

const app = getApps()[0];
export const adminDb = app ? getFirestore() : ({} as any);