import { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

export interface IUniqueFrequency {
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
}

export interface IHabitHistory {
    date: string; // YYYY-MM-DD
    status: "completed" | "failed" | "pending" | "none";
}

export interface IHabit {
    id?: string;
    userId: string;
    name: string;
    category: string;
    icon: string;
    iconColorClass: string;
    iconBgClass: string;
    goal: number;
    frequency: IUniqueFrequency;
    history: IHabitHistory[];
}

export const habitConverter = {
    toFirestore(habit: IHabit): DocumentData {
        const { id, ...data } = habit;
        return data; // userId is already in data
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot
    ): IHabit {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            userId: data.userId,
            name: data.name,
            category: data.category,
            icon: data.icon,
            iconColorClass: data.iconColorClass,
            iconBgClass: data.iconBgClass,
            goal: data.goal,
            frequency: data.frequency,
            history: data.history || [],
        };
    },
};
