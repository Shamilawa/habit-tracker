import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Habit from "@/models/Habit";

export async function GET() {
    await dbConnect();

    try {
        let habits = await Habit.find({});

        // Seed initial data if empty
        if (habits.length === 0) {
            const initialHabits = [
                {
                    name: "Morning Jog",
                    category: "Health",
                    icon: "directions_run",
                    iconColorClass: "text-blue-600 dark:text-blue-400",
                    iconBgClass: "bg-blue-100 dark:bg-blue-900/50",
                    goal: 7,
                    history: [],
                },
                {
                    name: "Read 30 mins",
                    category: "Learning",
                    icon: "menu_book",
                    iconColorClass: "text-purple-600 dark:text-purple-400",
                    iconBgClass: "bg-purple-100 dark:bg-purple-900/50",
                    goal: 7,
                    history: [],
                },
                {
                    name: "Deep Work",
                    category: "Productivity",
                    icon: "laptop_mac",
                    iconColorClass: "text-orange-600 dark:text-orange-400",
                    iconBgClass: "bg-orange-100 dark:bg-orange-900/50",
                    goal: 5,
                    history: [],
                },
                {
                    name: "Meditation",
                    category: "Wellness",
                    icon: "self_improvement",
                    iconColorClass: "text-teal-600 dark:text-teal-400",
                    iconBgClass: "bg-teal-100 dark:bg-teal-900/50",
                    goal: 7,
                    history: [],
                },
            ];
            habits = await Habit.create(initialHabits);
        }

        return NextResponse.json(habits);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch habits" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const habit = await Habit.create(body);
        return NextResponse.json(habit, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create habit" },
            { status: 500 }
        );
    }
}
