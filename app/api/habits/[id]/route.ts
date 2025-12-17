import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Habit from "@/models/Habit";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;

    try {
        const body = await request.json();

        // Check if it's a history update (tracking) vs general update
        if (body.date && body.status) {
            const { date, status } = body;
            const habit = await Habit.findById(id);

            if (!habit) {
                return NextResponse.json(
                    { error: "Habit not found" },
                    { status: 404 }
                );
            }

            // Remove existing entry for this date if it exists
            habit.history = habit.history.filter((h: any) => h.date !== date);

            // Add new entry if status is not 'none'
            if (status !== "none") {
                habit.history.push({ date, status });
            }

            await habit.save();
            return NextResponse.json(habit);
        }

        // General Update (Edit Habit)
        const updatedHabit = await Habit.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedHabit) {
            return NextResponse.json(
                { error: "Habit not found" },
                { status: 404 }
            );
        }

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
    await dbConnect();
    const { id } = await params;

    try {
        const deletedHabit = await Habit.findByIdAndDelete(id);

        if (!deletedHabit) {
            return NextResponse.json(
                { error: "Habit not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Habit deleted successfully" });
    } catch (error) {
        console.error("Error deleting habit:", error);
        return NextResponse.json(
            { error: "Failed to delete habit" },
            { status: 500 }
        );
    }
}
