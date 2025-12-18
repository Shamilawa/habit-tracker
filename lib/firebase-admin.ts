import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

function formatPrivateKey(key: string | undefined) {
    return key?.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Missing Firebase Admin credentials. Please check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local"
        );
    }

    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: formatPrivateKey(privateKey),
            }),
        });
        console.log("Firebase Admin Initialized successfully");
    } catch (error) {
        console.error("Firebase admin initialization error", error);
        throw error; // Construct the app, or fail hard.
    }
}

const db = getFirestore();

export { db };
