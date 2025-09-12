// USAGE: node src/lib/create-super-admin.js

require('dotenv').config({ path: './.env' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createSuperAdmin() {
  const superAdminUid = process.env.NEXT_PUBLIC_SUPER_ADMIN_UID;
  const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

  if (!superAdminUid || !superAdminEmail) {
    console.error('Error: NEXT_PUBLIC_SUPER_ADMIN_UID and NEXT_PUBLIC_SUPER_ADMIN_EMAIL must be set in your .env file.');
    process.exit(1);
  }

  try {
    const adminRef = doc(db, 'admins', superAdminUid);
    await setDoc(adminRef, {
      email: superAdminEmail,
      name: 'Super Admin',
      role: 'superadmin',
      status: 'approved',
      createdAt: new Date(),
    });
    console.log(`Successfully created super admin document for UID: ${superAdminUid}`);
  } catch (error) {
    console.error('Error creating super admin document:', error);
  } finally {
    // The script hangs without explicitly exiting.
    process.exit(0);
  }
}

createSuperAdmin();
