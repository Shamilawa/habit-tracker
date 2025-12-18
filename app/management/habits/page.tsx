"use client";

import { useEffect, useState } from "react";
import CreateHabitModal from "../../components/CreateHabitModal";
import Icon from "../../components/ui/Icon";
import { Habit } from "@/app/types/habit";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "sonner";
import { TableRowSkeleton } from "../../components/ui/Skeleton";
import { useAuth } from "@/app/context/AuthContext";

interface ApiHabit extends Omit<Habit, "dailyStatuses"> {
    // Frequency matches exactly
    frequency: {
        sunday: boolean;
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
    };
    history: { date: string; status: string }[];
}

export default function HabitManagementPage() {
    const { user } = useAuth();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
    const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

    const fetchHabits = async () => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const res = await fetch("/api/habits", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch habits");
            const data: ApiHabit[] = await res.json();

            // Transform
            const transformedHabits: Habit[] = data.map((h) => ({
                id: h.id,
                _id: h.id,
                name: h.name,
                category: h.category,
                icon: h.icon,
                iconColorClass: h.iconColorClass,
                iconBgClass: h.iconBgClass,
                goal: h.goal,
                userId: h.userId, // Include userId
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
                dailyStatuses: [],
            }));

            setHabits(transformedHabits);
        } catch (error) {
            console.error("Error fetching habits:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchHabits();
        else setIsLoading(false);
    }, [user]);

    const handleEdit = (habit: Habit) => {
        setSelectedHabit(habit);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (habitId: string) => {
        setHabitToDelete(habitId);
    };

    const confirmDelete = async () => {
        if (!habitToDelete || !user) return;

        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/habits/${habitToDelete}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to delete habit");

            toast.success("Habit deleted successfully");
            fetchHabits(); // Refresh list
        } catch (error) {
            console.error("Error deleting habit:", error);
            toast.error("Failed to delete habit");
        } finally {
            setHabitToDelete(null);
        }
    };

    const handleCreate = () => {
        setSelectedHabit(null);
        setIsEditModalOpen(true);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Habit Management
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Create, edit, and delete your habits.
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10 border-b border-border-light dark:border-border-dark">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Frequency
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                        {isLoading ? (
                            <>
                                <TableRowSkeleton />
                                <TableRowSkeleton />
                                <TableRowSkeleton />
                                <TableRowSkeleton />
                                <TableRowSkeleton />
                            </>
                        ) : habits.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500">
                                    No habits found. Create your first one!
                                </td>
                            </tr>
                        ) : (
                            habits.map((habit) => (
                                <tr
                                    key={habit.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded flex items-center justify-center ${habit.iconBgClass} ${habit.iconColorClass}`}
                                            >
                                                <Icon
                                                    name={habit.icon}
                                                    className="text-lg"
                                                />
                                            </div>
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {habit.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                                            {habit.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        {
                                            Object.values(
                                                habit.frequency
                                            ).filter(Boolean).length
                                        }{" "}
                                        days/week
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(habit)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            title="Edit"
                                        >
                                            <Icon
                                                name="edit"
                                                className="text-lg"
                                            />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteClick(habit.id)
                                            }
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Delete"
                                        >
                                            <Icon
                                                name="delete"
                                                className="text-lg"
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit/Create Modal controlled by this page */}
            {isEditModalOpen && (
                <CreateHabitModal
                    initialData={selectedHabit}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        fetchHabits();
                        setIsEditModalOpen(false);
                        toast.success(selectedHabit ? "Habit updated successfully" : "Habit created successfully");
                    }}
                />
            )}

            <ConfirmationModal
                isOpen={!!habitToDelete}
                onClose={() => setHabitToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Habit"
                message="Are you sure you want to delete this habit? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
}
