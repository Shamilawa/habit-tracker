"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Icon from "./ui/Icon";
import Editor from "./Editor";
import { Habit } from "@/app/types/habit";
import { cn } from "@/lib/utils";
import { HabitSkeleton, JournalSkeleton } from "./ui/Skeleton";

// Helper for date formatting
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    }).format(date);
};

const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
};

const getYyyyMmDd = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
};

// Helper for color mapping (reused from HabitTable)
const COLOR_MAP: Record<string, string> = {
    blue: "bg-blue-600 dark:bg-blue-400",
    purple: "bg-purple-600 dark:bg-purple-400",
    orange: "bg-orange-600 dark:bg-orange-400",
    teal: "bg-teal-600 dark:bg-teal-400",
    emerald: "bg-emerald-600 dark:bg-emerald-400",
    rose: "bg-rose-600 dark:bg-rose-400",
    indigo: "bg-indigo-600 dark:bg-indigo-400",
    cyan: "bg-cyan-600 dark:bg-cyan-400",
};

interface DashboardProps {
    initialHabits: Habit[];
}

export default function Dashboard({ initialHabits }: DashboardProps) {
    const router = useRouter();
    const [date, setDate] = useState(new Date());
    const [habits, setHabits] = useState<Habit[]>(initialHabits);
    const [journalContent, setJournalContent] = useState("");
    const [isJournalLoading, setIsJournalLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const dateString = useMemo(() => getYyyyMmDd(date), [date]);

    // Fetch Journal
    useEffect(() => {
        const fetchJournal = async () => {
            setIsJournalLoading(true);
            setJournalContent(""); // Clear content to avoid stale data in Editor
            try {
                const res = await fetch(`/api/journal?date=${dateString}`);
                const data = await res.json();
                if (data.content) {
                    setJournalContent(data.content);
                } else {
                    setJournalContent("");
                }
            } catch (error) {
                console.error("Error fetching journal:", error);
            } finally {
                setIsJournalLoading(false);
            }
        };

        fetchJournal();
    }, [dateString]);

    const handleSaveJournal = async () => {
        if (!journalContent) return;

        setIsSaving(true);
        try {
            const res = await fetch("/api/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: dateString, content: journalContent }),
            });
            if (!res.ok) throw new Error("Failed to save");
            setLastSaved(new Date());
            toast.success("Journal saved");
        } catch (error) {
            console.error("Error saving journal:", error);
            toast.error("Failed to save note");
        } finally {
            setIsSaving(false);
        }
    };

    const activeHabits = useMemo(() => {
        const dayName = getDayName(date);
        return habits.filter((h) => (h.frequency as any)[dayName]);
    }, [habits, date]);

    const getHabitStatus = useCallback((habit: Habit) => {
        const entry = habit.dailyStatuses?.find((h) => h.date === dateString);
        return entry ? entry.status : "pending";
    }, [dateString]);

    const getSolidBgClass = (habitColorClass: string) => {
        const match = habitColorClass.match(/text-([a-z]+)-/);
        const color = match ? match[1] : "indigo";
        return COLOR_MAP[color] || COLOR_MAP["indigo"];
    };

    const handleToggle = async (habitId: string) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        const currentStatus = getHabitStatus(habit);

        let newStatus = currentStatus;
        if (currentStatus === "none" || currentStatus === "pending") {
            newStatus = "completed";
        } else if (currentStatus === "completed") {
            newStatus = "failed"; // Or back to pending/none? Table logic says failed.
        } else {
            newStatus = "none"; // Reset
        }

        // Optimistic Update
        setHabits(prev => {
            const updated = prev.map(h => {
                if (h.id !== habitId) return h;

                // Remove old status for this date if exists
                const otherStatuses = h.dailyStatuses.filter(s => s.date !== dateString);
                // Add new status
                return {
                    ...h,
                    dailyStatuses: [...otherStatuses, { date: dateString, status: newStatus as any }]
                };
            });
            return updated;
        });

        try {
            const res = await fetch(`/api/habits/${habitId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: dateString, status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update");
        } catch (error) {
            console.error("Error updating habit:", error);
            toast.error("Failed to update habit status");
            // Revert logic could go here
        }
    };

    const handlePrevDay = () => {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() - 1);
        setJournalContent(""); // Clear immediately to prevent stale data
        setDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + 1);
        setJournalContent(""); // Clear immediately to prevent stale data
        setDate(newDate);
    };

    const handleToday = () => {
        const today = new Date();
        const todayStr = getYyyyMmDd(today);
        if (todayStr !== dateString) {
            setJournalContent(""); // Clear immediately to prevent stale data
            setDate(today);
        }
    };

    const completedCount = activeHabits.filter(h => getHabitStatus(h) === "completed").length;
    const progressPercentage = activeHabits.length > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0;

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
            {/* Global Header */}
            <header className="flex-none px-6 py-5 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                    {/* Divider Decoration */}
                    <div className="w-1 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />

                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">
                                {formatDate(date)}
                            </h1>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border",
                                progressPercentage === 100
                                    ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                    : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                            )}>
                                {progressPercentage}% DONE
                            </span>
                        </div>

                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handlePrevDay}
                        className="flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all active:scale-90"
                        title="Previous Day"
                    >
                        <Icon name="chevron_left" className="text-xl" />
                    </button>
                    <button
                        onClick={handleToday}
                        className="flex items-center justify-center px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all active:scale-95 uppercase tracking-wider h-full"
                    >
                        Today
                    </button>
                    <button
                        onClick={handleNextDay}
                        className="flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all active:scale-90"
                        title="Next Day"
                    >
                        <Icon name="chevron_right" className="text-xl" />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Habit List */}
                <div className="w-1/4 min-w-[350px] border-r border-border-light dark:border-border-dark flex flex-col bg-slate-50/30 dark:bg-slate-900/10">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Routine Summary</h2>
                        </div>

                        <div className="space-y-2">
                            {activeHabits.length === 0 ? (
                                <div className="text-center py-8 text-sm text-slate-500">
                                    No habits scheduled for today.
                                </div>
                            ) : (
                                activeHabits.map((habit) => {
                                    const status = getHabitStatus(habit);
                                    const isCompleted = status === "completed";
                                    const isFailed = status === "failed";

                                    return (
                                        <div key={habit.id} className="group flex items-center justify-between p-3 bg-white dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", habit.iconBgClass, habit.iconColorClass)}>
                                                    <Icon name={habit.icon} className="text-xl" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-slate-900 dark:text-white text-sm">{habit.name}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {habit.goal > 0 ? `${habit.goal} mins` : "Daily"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Interactive Toggle */}
                                            <button
                                                onClick={() => handleToggle(habit.id)}
                                                className={cn(
                                                    "w-8 h-8 rounded-md flex items-center justify-center transition-all",
                                                    isCompleted
                                                        ? `${getSolidBgClass(habit.iconColorClass)} text-white shadow-sm border border-transparent scale-100`
                                                        : isFailed
                                                            ? "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-500"
                                                            : "bg-white dark:bg-surface-dark border-2 border-slate-300 dark:border-slate-600 text-transparent hover:border-primary dark:hover:border-primary-dark"
                                                )}
                                            >
                                                {isCompleted && <Icon name="check" className="text-sm font-bold" />}
                                                {isFailed && <Icon name="close" className="text-sm font-bold" />}
                                                {!isCompleted && !isFailed && <Icon name="check" className={cn("text-sm font-bold opacity-0 hover:opacity-100 transition-opacity", habit.iconColorClass)} />}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Journal Editor */}
                <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
                    <div className="flex-1 h-full">
                        {isJournalLoading ? (
                            <JournalSkeleton />
                        ) : (
                            <Editor
                                key={dateString}
                                content={journalContent}
                                onChange={setJournalContent}
                                onSave={handleSaveJournal}
                                lastSavedRequestAt={lastSaved}
                                isSaving={isSaving}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
