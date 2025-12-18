
import { redirect } from "next/navigation";
import { db } from "@/lib/firebase-admin";
import { habitConverter } from "@/models/Habit";
import Dashboard from "./components/Dashboard";
import { Habit } from "./types/habit";

// This is a Server Component
export default async function Home() {
    try {
        const habitsRef = db.collection("habits").withConverter(habitConverter);
        const snapshot = await habitsRef.get();
        const habits = snapshot.docs.map((doc) => doc.data());

        if (habits.length === 0) {
            redirect("/onboard");
        }

        // Transform for client (serialize timestamps etc if needed, though here we mostly have simple types)
        // Ensure _id/id is consistent
        const transformedHabits: Habit[] = habits.map((h) => ({
            id: h.id!,
            _id: h.id!,
            name: h.name,
            category: h.category,
            icon: h.icon,
            iconColorClass: h.iconColorClass,
            iconBgClass: h.iconBgClass,
            goal: h.goal,
            frequency: h.frequency || {
                sunday: true,
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: true,
            },
            weeklyProgress: 0,
            dailyStatuses: h.history.map((hist: any) => ({
                date: hist.date, // YYYY-MM-DD
                status: hist.status as any
            })),
        }));

        return <Dashboard initialHabits={transformedHabits} />;

    } catch (error) {
        console.error("Error fetching habits on server:", error);
        // Fallback or error page logic, but if redirect throws, Next.js handles it.
        // We need to re-throw redirect error
        if (isRedirectError(error)) {
            throw error;
        }

        return (
            <div className="flex h-screen items-center justify-center text-red-500">
                Failed to load application data.
            </div>
        );
    }
}

function isRedirectError(error: any) {
    return error?.digest?.startsWith?.('NEXT_REDIRECT');
}
