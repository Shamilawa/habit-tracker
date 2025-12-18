"use client";

import { useState, useMemo, useEffect } from "react";
import WeekNavigation from "../components/WeekNavigation";
import StatsCard from "../components/StatsCard";
import HabitTable from "../components/HabitTable";
import Icon from "../components/ui/Icon";
import { Habit, DailyStatus } from "@/app/types/habit";
import {
    getStartOfWeek,
    getWeekDays,
    formatDateRange,
    getWeekNumber,
} from "../utils/dateUtils";
import { useUI } from "../context/UIContext";
import { StatsSkeleton, TableGridSkeleton } from "../components/ui/Skeleton";

interface ApiHabit extends Omit<Habit, "dailyStatuses"> {
    _id?: string;
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

export default function WeeklyTrackerPage() {
    const { openCreateHabitModal, lastUpdated } = useUI();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);

    const { weekDays, weekLabel, dateRangeLabel } = useMemo(() => {
        const start = getStartOfWeek(currentDate);
        const days = getWeekDays(start);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);

        return {
            weekDays: days,
            weekLabel: `Week ${getWeekNumber(start)}, ${start.getFullYear()}`,
            dateRangeLabel: `${formatDateRange(start, end)}`,
        };
    }, [currentDate]);

    const [habits, setHabits] = useState<Habit[]>([]);

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const res = await fetch("/api/habits");
                if (!res.ok) throw new Error("Failed to fetch habits");
                const data: ApiHabit[] = await res.json();

                // Transform API data to frontend model
                const currentWeekDays = getWeekDays(
                    getStartOfWeek(currentDate)
                ).map((d) => d.fullDate);

                const transformedHabits: Habit[] = data.map((apiHabit) => {
                    const dailyStatuses: DailyStatus[] = currentWeekDays.map(
                        (date) => {
                            const historyEntry = apiHabit.history.find(
                                (h) => h.date === date
                            );
                            return {
                                date,
                                status:
                                    (historyEntry?.status as DailyStatus["status"]) ||
                                    "none",
                            };
                        }
                    );

                    const completedCount = dailyStatuses.filter(
                        (d) => d.status === "completed"
                    ).length;

                    return {
                        id: apiHabit.id || apiHabit._id!,
                        _id: apiHabit.id || apiHabit._id!,
                        name: apiHabit.name,
                        category: apiHabit.category,
                        icon: apiHabit.icon,
                        iconColorClass: apiHabit.iconColorClass,
                        iconBgClass: apiHabit.iconBgClass,
                        goal: apiHabit.goal,
                        frequency: apiHabit.frequency || {
                            sunday: true,
                            monday: true,
                            tuesday: true,
                            wednesday: true,
                            thursday: true,
                            friday: true,
                            saturday: true,
                        },
                        weeklyProgress: completedCount,
                        dailyStatuses,
                    };
                });

                setHabits(transformedHabits);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHabits();
    }, [currentDate, lastUpdated]); // Refetch when week changes OR when lastUpdated changes (new habit added)

    const handlePreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const handleToggleHabit = async (habitId: string, date: string) => {
        // Find current habit and status
        const habit = habits.find((h) => h.id === habitId);
        if (!habit) return;

        const dayStatus = habit.dailyStatuses.find((d) => d.date === date);
        if (!dayStatus) return;

        // Calculate next status
        let newStatus = dayStatus.status;
        if (dayStatus.status === "none" || dayStatus.status === "pending") {
            newStatus = "completed";
        } else if (dayStatus.status === "completed") {
            newStatus = "failed";
        } else {
            newStatus = "none";
        }

        // Optimistic update
        setHabits((prevHabits) =>
            prevHabits.map((h) => {
                if (h.id !== habitId) return h;

                const newDailyStatuses = h.dailyStatuses.map((day) => {
                    if (day.date !== date) return day;
                    return {
                        ...day,
                        status: newStatus as DailyStatus["status"],
                    };
                });

                const completedCount = newDailyStatuses.filter(
                    (d) => d.status === "completed"
                ).length;

                return {
                    ...h,
                    dailyStatuses: newDailyStatuses,
                    weeklyProgress: completedCount,
                };
            })
        );

        // API call
        try {
            const res = await fetch(`/api/habits/${habitId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, status: newStatus }),
            });

            if (!res.ok) {
                throw new Error("Failed to update habit");
            }
        } catch (error) {
            console.error(error);
            // Revert on error (could be implemented here, but keeping simple for now)
            alert("Failed to save changes. Please try again.");
        }
    };



    return (
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Weekly Overview
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Track your progress for {dateRangeLabel}
                        </p>
                    </div>
                    <WeekNavigation
                        label={weekLabel}
                        onPrev={handlePreviousWeek}
                        onNext={handleNextWeek}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {isLoading ? (
                        <>
                            <StatsSkeleton />
                            <StatsSkeleton />
                            <StatsSkeleton />
                        </>
                    ) : (
                        <>
                            <StatsCard
                                title="Completion Rate"
                                value="87%"
                                subValue={
                                    <>
                                        <Icon
                                            name="trending_up"
                                            className="text-sm mr-0.5"
                                        />{" "}
                                        12%
                                    </>
                                }
                                icon="check_circle"
                                iconColorClass="text-emerald-600 dark:text-emerald-400"
                                iconBgClass="bg-emerald-100 dark:bg-emerald-900/30"
                            />
                            <StatsCard
                                title="Perfect Days"
                                value="4"
                                subValue="/ 7 days"
                                icon="emoji_events"
                                iconColorClass="text-blue-600 dark:text-blue-400"
                                iconBgClass="bg-blue-100 dark:bg-blue-900/30"
                            />
                            <StatsCard
                                title="Current Streak"
                                value="12"
                                subValue="days"
                                icon="local_fire_department"
                                iconColorClass="text-orange-600 dark:text-orange-400"
                                iconBgClass="bg-orange-100 dark:bg-orange-900/30"
                            />
                        </>
                    )}
                </div>

                {isLoading ? (
                    <TableGridSkeleton />
                ) : (
                    <HabitTable
                        habits={habits}
                        weekDays={weekDays}
                        onToggleHabit={handleToggleHabit}
                    />
                )}
            </div>
        </div>
    );
}
