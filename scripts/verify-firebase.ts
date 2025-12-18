import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import admin from "firebase-admin";

console.log("Checking environment variables...");
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (projectId) console.log("FIREBASE_PROJECT_ID: Found");
else console.error("FIREBASE_PROJECT_ID: Missing");

if (clientEmail) console.log("FIREBASE_CLIENT_EMAIL: Found");
else console.error("FIREBASE_CLIENT_EMAIL: Missing");

if (privateKey) console.log("FIREBASE_PRIVATE_KEY: Found");
else console.error("FIREBASE_PRIVATE_KEY: Missing");

if (!projectId || !clientEmail || !privateKey) {
    console.error("Stopping due to missing variables.");
    process.exit(1);
}

try {
    console.log("Initializing Firebase Admin...");
    let formattedKey = privateKey.replace(/\\n/g, "\n");

    // Diagnostic logging
    console.log("Key Diagnostics:");
    console.log("Original Length:", privateKey.length);
    console.log("Formatted Length:", formattedKey.length);
    console.log("Starts with Header:", formattedKey.startsWith("-----BEGIN PRIVATE KEY-----"));
    console.log("Ends with Footer:", formattedKey.trim().endsWith("-----END PRIVATE KEY-----"));
    console.log("Contains actual newlines:", formattedKey.includes("\n"));
    console.log("Contains \\n literals:", privateKey.includes("\\n"));

    const safeStart = formattedKey.length > 30 ? formattedKey.substring(0, 30) : formattedKey;
    const safeEnd = formattedKey.length > 30 ? formattedKey.trim().substring(formattedKey.length - 30) : "";
    console.log(`First 30 chars (safe): [${safeStart}]`);
    console.log(`Last 30 chars (safe): [${safeEnd}]`);

    // Cleanup quotes if accidentally included
    if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
        console.log("Detecting wrapping double quotes, removing...");
        formattedKey = formattedKey.slice(1, -1);
        // Re-replace newlines if they were escaped inside the quotes
        formattedKey = formattedKey.replace(/\\n/g, "\n");
    }

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: formattedKey,
        }),
    });
    console.log("Initialization successful.");

    console.log("Attempting to list collections...");
    const db = admin.firestore();
    db.listCollections().then((collections) => {
        console.log("Connection successful! Collections found:", collections.map(c => c.id));
        process.exit(0);
    }).catch((err) => {
        console.error("Failed to connect to Firestore:", err);
        process.exit(1);
    });

} catch (error) {
    console.error("Initialization threw an error:", error);
    process.exit(1);
}
