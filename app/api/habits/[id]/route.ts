import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { habitConverter } from "@/models/Habit";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        const docRef = db.collection("habits").doc(id).withConverter(habitConverter);
        const docSnap = await docRef.get();
        const habit = docSnap.data();

        if (!habit) {
            return NextResponse.json(
                { error: "Habit not found" },
                { status: 404 }
            );
        }

        // Check if it's a history update (tracking) vs general update
        if (body.date && body.status) {
            const { date, status } = body;

            // Remove existing entry for this date if it exists
            const newHistory = habit.history.filter((h: any) => h.date !== date);

            // Add new entry if status is not 'none'
            if (status !== "none") {
                newHistory.push({ date, status });
            }

            // Update in Firestore
            await docRef.update({ history: newHistory });

            // Return updated object
            return NextResponse.json({ ...habit, history: newHistory });
        }

        // General Update (Edit Habit)
        // Ensure strictly only fields from body are updated
        await docRef.set({ ...habit, ...body }, { merge: true });

        // Fetch fresh data
        const updatedSnap = await docRef.get();
        const updatedHabit = updatedSnap.data();

        return NextResponse.json(updatedHabit);
    } catch (error) {
        console.error("Error updating habit:", error);
        return NextResponse.json(
            { error: "Failed to update habit" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const docRef = db.collection("habits").doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json(
                { error: "Habit not found" },
                { status: 404 }
            );
        }

        await docRef.delete();

        return NextResponse.json({ message: "Habit deleted successfully" });
    } catch (error) {
        console.error("Error deleting habit:", error);
        return NextResponse.json(
            { error: "Failed to delete habit" },
            { status: 500 }
        );
    }
}
