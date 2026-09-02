import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { ItemRegistration, RewardRedemption, StudentUser } from '../types';

// Collections
const USERS_COLLECTION = 'users';
const REGISTRATIONS_COLLECTION = 'registrations';
const REDEMPTIONS_COLLECTION = 'redemptions';

/**
 * Save or update student user in Firestore
 */
export async function syncUserToFirestore(user: StudentUser): Promise<void> {
  try {
    const userDocId = user.email.replace(/[@.]/g, '_');
    const userRef = doc(db, USERS_COLLECTION, userDocId);
    await setDoc(
      userRef,
      {
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        dormBuilding: user.dormBuilding,
        roomNumber: user.roomNumber,
        totalMileage: user.totalMileage,
        isVerified: user.isVerified,
        isGuest: Boolean(user.isGuest),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to sync user to Firestore:', error);
  }
}

/**
 * Save a new item registration to Firestore
 */
export async function saveRegistrationToFirestore(
  item: ItemRegistration,
  userEmail: string
): Promise<void> {
  try {
    const docRef = doc(db, REGISTRATIONS_COLLECTION, item.id);
    await setDoc(docRef, {
      ...item,
      userEmail,
      createdAtTimestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to save registration to Firestore:', error);
  }
}

/**
 * Save a new reward redemption record to Firestore
 */
export async function saveRedemptionToFirestore(
  redemption: RewardRedemption,
  userEmail: string
): Promise<void> {
  try {
    const docRef = doc(db, REDEMPTIONS_COLLECTION, redemption.id);
    await setDoc(docRef, {
      ...redemption,
      userEmail,
      createdAtTimestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to save redemption to Firestore:', error);
    throw error;
  }
}

/**
 * Subscribe to user redemptions in real-time
 */
export function subscribeUserRedemptions(
  userEmail: string,
  callback: (redemptions: RewardRedemption[]) => void
) {
  try {
    const q = query(
      collection(db, REDEMPTIONS_COLLECTION),
      where('userEmail', '==', userEmail)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: RewardRedemption[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as RewardRedemption;
          list.push(data);
        });
        // Sort descending by redeemedAt or id
        list.sort((a, b) => b.id.localeCompare(a.id));
        callback(list);
      },
      (error) => {
        console.warn('Firestore subscription error (redemptions):', error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe redemptions:', err);
    return () => {};
  }
}

/**
 * Subscribe to user item registrations in real-time
 */
export function subscribeUserRegistrations(
  userEmail: string,
  callback: (registrations: ItemRegistration[]) => void
) {
  try {
    const q = query(
      collection(db, REGISTRATIONS_COLLECTION),
      where('userEmail', '==', userEmail)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: ItemRegistration[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ItemRegistration;
          list.push(data);
        });
        list.sort((a, b) => b.id.localeCompare(a.id));
        callback(list);
      },
      (error) => {
        console.warn('Firestore subscription error (registrations):', error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe registrations:', err);
    return () => {};
  }
}
