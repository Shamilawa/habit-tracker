export type DayStatus = "completed" | "failed" | "pending" | "none";

export interface DailyStatus {
    date: string; // YYYY-MM-DD
    status: DayStatus;
}

export interface Habit {
    id: string;
    _id?: string; // Optional MongoDB ID
    name: string;
    category: string;
    icon: string;
    iconColorClass: string;
    iconBgClass: string;
    goal: number; // e.g. 5 days per week
    frequency: {
        sunday: boolean;
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
    };
    weeklyProgress: number; // e.g. 5
    dailyStatuses: DailyStatus[];
}
