import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { JournalInteraction, UserProfile } from '../types';

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Initialize Cloud Firestore with specified databaseId if available
const databaseId = (firebaseConfig as any).firestoreDatabaseId;
export const db = databaseId
  ? getFirestore(app, databaseId)
  : getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Strips all `undefined` fields recursively to satisfy Zero-Crash Payload Hygiene.
 */
export function cleanFirestorePayload<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      cleaned[key] = cleanFirestorePayload(value);
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map((item) =>
        item !== null && typeof item === 'object' && !(item instanceof Date)
          ? cleanFirestorePayload(item)
          : item
      );
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

/**
 * Validate connection to Firestore on initial boot as required by Firebase skill.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is currently offline or unreachable:', error.message);
    }
    return false;
  }
}

/**
 * Sign In with Google, with graceful fallback to redirect if popup fails in iframe.
 */
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    console.warn('signInWithPopup failed, attempting signInWithRedirect:', err);
    if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/cancelled-popup-request') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectErr) {
        console.error('signInWithRedirect also failed:', redirectErr);
        throw redirectErr;
      }
    }
    throw err;
  }
}

/**
 * Sign Out
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Save user profile to `/users/{userId}`
 */
export async function saveUserProfile(user: User, activeTheme?: string): Promise<void> {
  if (!user.uid) return;
  const userRef = doc(db, 'users', user.uid);
  const data: UserProfile = cleanFirestorePayload({
    uid: user.uid,
    displayName: user.displayName || 'Gentle Soul',
    email: user.email,
    photoURL: user.photoURL,
    activeTheme: activeTheme || 'sakura-blossom',
    joinedAt: new Date().toISOString(),
  });
  await setDoc(userRef, data, { merge: true });
}

/**
 * Fetch user profile from `/users/{userId}`
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching user profile:', err);
    return null;
  }
}

/**
 * Save or update an interaction at `/users/{userId}/interactions/{interactionId}`
 * Isolated strictly to the authenticated user.
 */
export async function saveInteraction(
  userId: string,
  interaction: JournalInteraction
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to persist journal interactions.');
  }
  const interactionRef = doc(db, 'users', userId, 'interactions', interaction.id);
  const cleaned = cleanFirestorePayload({
    ...interaction,
    userId,
    updatedAt: new Date().toISOString(),
  });
  await setDoc(interactionRef, cleaned, { merge: true });
}

/**
 * Load all past journal interactions for the user, ordered by creation date descending.
 */
export async function loadUserInteractions(userId: string): Promise<JournalInteraction[]> {
  if (!userId) return [];
  try {
    const interactionsCol = collection(db, 'users', userId, 'interactions');
    const q = query(interactionsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const results: JournalInteraction[] = [];
    snapshot.forEach((docSnap) => {
      results.push(docSnap.data() as JournalInteraction);
    });
    return results;
  } catch (err) {
    console.warn('Error loading user interactions with ordering, trying fallback un-ordered query:', err);
    try {
      const fallbackCol = collection(db, 'users', userId, 'interactions');
      const fallbackSnap = await getDocs(fallbackCol);
      const fallbackResults: JournalInteraction[] = [];
      fallbackSnap.forEach((docSnap) => {
        fallbackResults.push(docSnap.data() as JournalInteraction);
      });
      return fallbackResults.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (innerErr) {
      console.error('Fatal error loading interactions:', innerErr);
      throw innerErr;
    }
  }
}

/**
 * Delete an interaction
 */
export async function deleteInteraction(userId: string, interactionId: string): Promise<void> {
  if (!userId || !interactionId) return;
  const interactionRef = doc(db, 'users', userId, 'interactions', interactionId);
  await deleteDoc(interactionRef);
}
