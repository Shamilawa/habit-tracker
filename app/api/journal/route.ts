import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { dayConverter } from "@/models/Day";
import { getAuth } from "firebase-admin/auth";

const verifyToken = async (request: Request) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.split("Bearer ")[1];
    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
};

export async function GET(req: NextRequest) {
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");

        if (!date) {
            return NextResponse.json(
                { error: "Date is required" },
                { status: 400 }
            );
        }

        const docId = `${userId}_${date}`;
        const docRef = db.collection("journal").doc(docId).withConverter(dayConverter);
        const docSnap = await docRef.get();
        const day = docSnap.data();

        return NextResponse.json({
            date,
            content: day ? day.content : "",
        });
    } catch (error) {
        console.error("Error fetching journal entry:", error);
        return NextResponse.json(
            { error: "Failed to fetch journal entry" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { date, content } = body;

        if (!date) {
            return NextResponse.json(
                { error: "Date is required" },
                { status: 400 }
            );
        }

        const docId = `${userId}_${date}`;
        const docRef = db.collection("journal").doc(docId).withConverter(dayConverter);

        // We need to pass userId to satisfy the interface, even if not strictly needed since included in ID
        await docRef.set({ date, content, userId }, { merge: true });

        // Return structured data
        return NextResponse.json({ date, content });
    } catch (error) {
        console.error("Error saving journal entry:", error);
        return NextResponse.json(
            { error: "Failed to save journal entry" },
            { status: 500 }
        );
    }
}
