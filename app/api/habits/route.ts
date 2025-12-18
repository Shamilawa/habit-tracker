import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { habitConverter } from "@/models/Habit";

export async function GET() {
    try {
        const habitsRef = db.collection("habits").withConverter(habitConverter);
        const snapshot = await habitsRef.get();
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
        const body = await request.json();
        const habitsRef = db.collection("habits").withConverter(habitConverter);

        const docRef = await habitsRef.add(body);
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
