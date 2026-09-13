import { initializeApp, getApps, cert, firestore, auth } from 'firebase-admin';

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
    console.log('Firebase admin initialization error', error?.stack);
  }
}

export const adminDb = firestore();
export const adminAuth = auth();