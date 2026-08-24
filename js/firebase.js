// ============================================================
// UMAMTEK â€” Firebase configuration
// ============================================================
// Replace the values below with YOUR Firebase project's config.
// Find it at: Firebase Console â†’ Project Settings â†’ General
// â†’ "Your apps" â†’ SDK setup and configuration â†’ Config
//
// IMPORTANT SETUP STEPS (do these in Firebase Console first):
// 1. Create a Firebase project (or use an existing one).
// 2. Go to Build â†’ Authentication â†’ Sign-in method â†’ enable "Phone".
// 3. Phone Auth requires the "Blaze" (pay-as-you-go) billing plan.
//    The free "Spark" plan does NOT support phone/OTP sign-in.
//    Blaze still has a generous free tier â€” you only pay if you
//    cross it, and OTP volume for a local business is very low cost.
// 4. Go to Authentication â†’ Settings â†’ Authorized domains â†’
//    add your live domain (e.g. umamtek.com) once you deploy.
//    "localhost" is already allowed by default for testing.
// 5. (Optional but recommended) Go to Build â†’ Firestore Database
//    â†’ Create database, so signup can save name + mobile number
//    against each user.
// ============================================================

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

// Initialize Firebase (compat SDK â€” loaded via <script> tags in the HTML files)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore ? firebase.firestore() : null;