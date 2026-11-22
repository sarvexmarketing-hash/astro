import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithPhoneNumber,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  ConfirmationResult,
  Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

if (typeof window !== "undefined" && firebaseConfig.apiKey) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (err) {
    console.warn("Firebase initialization skipped:", err);
  }
}

export { app, auth };

/**
 * Initialize invisible or visible reCAPTCHA verifier for Phone Auth.
 */
export function setupRecaptcha(containerId: string): RecaptchaVerifier | null {
  if (!auth) return null;
  try {
    return new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved
      },
      "expired-callback": () => {
        console.warn("reCAPTCHA expired, please try again.");
      },
    });
  } catch (err) {
    console.warn("reCAPTCHA setup skipped:", err);
    return null;
  }
}

/**
 * Send SMS verification code to phone number.
 */
export async function sendPhoneOtpFirebaseWeb(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  if (!auth) {
    throw new Error('Phone verification service is not initialized.');
  }
  const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber.replace(/\D/g, "")}`;
  return await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
}

/**
 * Sign in using Firebase Google popup provider.
 */
export async function signInWithGoogleFirebase() {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized.');
  }
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  return await signInWithPopup(auth, provider);
}

export default app;
