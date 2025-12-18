import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { habitConverter } from "@/models/Habit";
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

export async function GET(request: Request) {
    try {
        const userId = await verifyToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const habitsRef = db.collection("habits").withConverter(habitConverter);
        const snapshot = await habitsRef.where("userId", "==", userId).get();
        let habits = snapshot.docs.map((doc) => doc.data());

        return NextResponse.json(habits);
    } catch (error) {
        console.error("Error fetching habits:", error);
        return NextResponse.json(
            { error: "Failed to fetch habits" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const userId = await verifyToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const habitsRef = db.collection("habits").withConverter(habitConverter);

        const newHabit = {
            ...body,
            userId, // Enforce userId from token
        };

        const docRef = await habitsRef.add(newHabit);
        const snapshot = await docRef.get();
        const habit = snapshot.data();

        return NextResponse.json(habit, { status: 201 });
    } catch (error) {
        console.error("Error creating habit:", error);
        return NextResponse.json(
            { error: "Failed to create habit" },
            { status: 500 }
        );
    }
}
