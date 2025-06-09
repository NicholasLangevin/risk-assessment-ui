// src/app/actions/updateSubjectToOffers.ts
'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface UpdateResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function updateSubjectToOffersInDB(quoteId: string, offerTexts: string[]): Promise<UpdateResult> {
  if (!quoteId) {
    return { success: false, message: 'Quote ID is required.' };
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.warn('Firebase project ID is not configured. Database operations will likely fail. Please check your .env.local file.');
    return { success: false, message: 'Firebase project not configured on the server.' };
  }

  const quoteRef = doc(db, 'quotes', quoteId);

  try {
    // Using setDoc with merge: true will create the document if it doesn't exist,
    // or update the specified fields if it does.
    await setDoc(quoteRef, {
      subjectToOffers: offerTexts,
      subjectToOffersUpdatedAt: new Date().toISOString(),
    }, { merge: true });
    
    return { success: true, message: 'Subject-to offers updated successfully in the database.' };
  } catch (error: any) {
    console.error('Error updating subject-to offers in DB:', error);
    return { success: false, message: 'Failed to update subject-to offers in the database.', error: error.message };
  }
}
