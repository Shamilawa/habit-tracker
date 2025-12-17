import { Habit } from "@/app/types/habit";

export function getHabitsForWeek(weekDays: string[]): Habit[] {
    // weekDays is an array of YYYY-MM-DD strings

    return [
        {
            id: "1",
            name: "Morning Jog",
            category: "Health",
            icon: "directions_run",
            iconColorClass: "text-blue-600 dark:text-blue-400",
            iconBgClass: "bg-blue-100 dark:bg-blue-900/50",
            goal: 7,
            weeklyProgress: 5,
            dailyStatuses: weekDays.map((date, index) => ({
                date,
                status:
                    index < 5
                        ? index === 2
                            ? "pending"
                            : "completed"
                        : "none", // Dummy logic
            })),
        },
        {
            id: "2",
            name: "Read 30 mins",
            category: "Learning",
            icon: "menu_book",
            iconColorClass: "text-purple-600 dark:text-purple-400",
            iconBgClass: "bg-purple-100 dark:bg-purple-900/50",
            goal: 7,
            weeklyProgress: 7,
            dailyStatuses: weekDays.map((date, index) => ({
                date,
                status:
                    index === 1 ? "failed" : index < 3 ? "completed" : "none", // Dummy logic
            })),
        },
        {
            id: "3",
            name: "Deep Work",
            category: "Productivity",
            icon: "laptop_mac",
            iconColorClass: "text-orange-600 dark:text-orange-400",
            iconBgClass: "bg-orange-100 dark:bg-orange-900/50",
            goal: 5,
            weeklyProgress: 5,
            dailyStatuses: weekDays.map((date, index) => ({
                date,
                status: index < 3 ? "completed" : "none",
            })),
        },
        {
            id: "4",
            name: "Meditation",
            category: "Wellness",
            icon: "self_improvement",
            iconColorClass: "text-teal-600 dark:text-teal-400",
            iconBgClass: "bg-teal-100 dark:bg-teal-900/50",
            goal: 7,
            weeklyProgress: 7,
            dailyStatuses: weekDays.map((date, index) => ({
                date,
                status: index === 1 ? "completed" : "none",
            })),
        },
    ];
}
