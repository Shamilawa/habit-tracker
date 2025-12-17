import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Habit from "@/models/Habit";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15+, params is a Promise
) {
    await dbConnect();
    const { id } = await params;

    try {
        const body = await request.json();
        const { date, status } = body;

        const habit = await Habit.findById(id);

        if (!habit) {
            return NextResponse.json(
                { error: "Habit not found" },
                { status: 404 }
            );
        }

        // Remove existing entry for this date if it exists
        habit.history = habit.history.filter((h) => h.date !== date);

        // Add new entry if status is not 'none'
        if (status !== "none") {
            habit.history.push({ date, status });
        }

        await habit.save();

        return NextResponse.json(habit);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update habit" },
            { status: 500 }
        );
    }
}
