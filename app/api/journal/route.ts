import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { dayConverter } from "@/models/Day";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");

        if (!date) {
            return NextResponse.json(
                { error: "Date is required" },
                { status: 400 }
            );
        }

        // Use date as standard document ID for easy lookup
        const docRef = db.collection("journal").doc(date).withConverter(dayConverter);
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
        const body = await req.json();
        const { date, content } = body;

        if (!date) {
            return NextResponse.json(
                { error: "Date is required" },
                { status: 400 }
            );
        }

        const docRef = db.collection("journal").doc(date).withConverter(dayConverter);

        await docRef.set({ date, content }, { merge: true });

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
