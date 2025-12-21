import React from "react";
import Icon from "./ui/Icon";
import { Habit, DayStatus } from "@/app/types/habit";
import { Category } from "@/app/types/category";
import { COLORS } from "@/app/utils/constants";
import { cn } from "@/lib/utils";

interface WeekDay {
    dayName: string;
    date: number;
    fullDate: string;
    isToday: boolean;
}

interface HabitTableProps {
    habits: Habit[];
    categories?: Category[];
    weekDays: WeekDay[];
    onToggleHabit?: (habitId: string, date: string) => void;
}

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

export default function HabitTable({
    habits,
    categories = [],
    weekDays,
    onToggleHabit,
}: HabitTableProps) {
    const [isGrouped, setIsGrouped] = React.useState(false);
    const [showMenu, setShowMenu] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = (
        habitId: string,
        date: string,
        e: React.MouseEvent
    ) => {
        e.preventDefault();
        if (onToggleHabit) {
            onToggleHabit(habitId, date);
        }
    };

    const getSolidBgClass = (habitColorClass: string) => {
        // Extract color name from class string (e.g., "text-blue-600")
        const match = habitColorClass.match(/text-([a-z]+)-/);
        const color = match ? match[1] : "indigo"; // default fallback
        return COLOR_MAP[color] || COLOR_MAP["indigo"];
    };

    // Helper to get habit visuals (Category > Habit)
    const getHabitVisuals = (habit: Habit) => {
        const category = categories.find(c => c.id === habit.categoryId);
        if (category && category.color) {
            const colorDef = Object.values(COLORS).find(c => c.name === category.color);
            if (colorDef) {
                return {
                    icon: habit.icon || "circle", // Habit has its own icon
                    colorClass: colorDef.textClass, // Category provides color
                    bgClass: colorDef.bgClass,
                    baseColor: colorDef
                };
            }
        }
        // Fallback
        return {
            icon: habit.icon,
            colorClass: habit.iconColorClass,
            bgClass: habit.iconBgClass,
            baseColor: null,
        };
    };

    // Helper: Parse time string into minutes from midnight
    const parseTime = (timeStr?: string): number => {
        if (!timeStr) return 9999; // No time -> End of list

        // Normalize: remove whitespace
        const str = timeStr.trim().toLowerCase();

        // Handle 12-hour format with am/pm
        const match12 = str.match(/(\d+):(\d+)\s*(am|pm)/);
        if (match12) {
            let hours = parseInt(match12[1], 10);
            const minutes = parseInt(match12[2], 10);
            const meridian = match12[3]; // am or pm

            // 12 AM -> 0 hours, 12 PM -> 12 hours
            if (hours === 12) {
                hours = meridian === "am" ? 0 : 12;
            } else if (meridian === "pm") {
                hours += 12;
            }
            return hours * 60 + minutes;
        }

        // Handle 24-hour format (HH:mm)
        const match24 = str.match(/(\d+):(\d+)/);
        if (match24) {
            const hours = parseInt(match24[1], 10);
            const minutes = parseInt(match24[2], 10);
            return hours * 60 + minutes;
        }

        return 9999; // Fallback
    };

    const groupedHabits = React.useMemo(() => {
        if (!isGrouped) return { "All": habits };

        const groups: Record<string, Habit[]> = {};

        // Sort habits first to ensure consistency within groups
        const sorted = [...habits].sort((a, b) => {
            return parseTime(a.startTime) - parseTime(b.startTime);
        });

        sorted.forEach(habit => {
            const cat = habit.category || "Uncategorized";
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(habit);
        });

        // Sort categories? Optional. Key iteration order in JS is insertion order for strings usually.
        return groups;
    }, [habits, isGrouped]);

    const renderDayCell = (
        status: DayStatus,
        colorClass: string,
        bgClass: string,
        isToday: boolean = false,
        onClick: (e: React.MouseEvent) => void,
        baseColor: typeof COLORS[0] | null = null
    ) => {
        if (status === "completed") {
            const filledBgClass = baseColor?.solidClass || "bg-indigo-600 dark:bg-indigo-400";
            return (
                <button
                    onClick={onClick}
                    className={`w-8 h-8 rounded-md ${filledBgClass} text-white shadow-sm border border-transparent flex items-center justify-center transition-transform active:scale-95`}
                >
                    <Icon name="check" className="text-sm font-bold" />
                </button>
            );
        } else if (status === "failed") {
            return (
                <button
                    onClick={onClick}
                    className="w-8 h-8 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-500 flex items-center justify-center"
                >
                    <Icon name="close" className="text-sm" />
                </button>
            );
        } else if (status === "pending" && isToday) {
            const hoverBorderClass = baseColor?.hoverBorderClass || "hover:border-primary dark:hover:border-primary-dark";
            return (
                <button
                    onClick={onClick}
                    className={`w-8 h-8 rounded-md bg-white dark:bg-surface-dark border-2 border-slate-300 dark:border-slate-600 text-transparent ${hoverBorderClass} transition-all flex items-center justify-center`}
                >
                    <Icon
                        name="check"
                        className={`text-sm opacity-0 hover:opacity-100 ${colorClass}`}
                    />
                </button>
            );
        } else {
            const hoverBorderClass = baseColor?.hoverBorderClass || "hover:border-primary dark:hover:border-primary-dark";
            return (
                <button
                    onClick={onClick}
                    className={`w-8 h-8 rounded-md bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 ${hoverBorderClass} flex items-center justify-center transition-colors`}
                ></button>
            );
        }
    };

    const renderHabitRow = (habit: Habit) => {
        const visual = getHabitVisuals(habit);
        return (
            <div
                key={habit.id}
                className="grid grid-cols-[minmax(220px,1.8fr)_repeat(7,1fr)_80px] group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            >
                <div className="p-4 flex items-center gap-3">
                    <div
                        className={`w-8 h-8 rounded ${visual.bgClass} ${visual.colorClass} flex items-center justify-center`}
                    >
                        <Icon name={visual.icon} className="text-lg" />
                    </div>
                    <div className="flex flex-col min-w-0 pr-2">
                        <span
                            className="text-sm font-medium text-slate-900 dark:text-white truncate"
                            title={habit.name}
                        >
                            {habit.name}
                        </span>
                        <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-500">
                            <span className="font-medium text-slate-600 dark:text-slate-400">
                                {habit.category}
                            </span>
                            <span>•</span>
                            <span>
                                {habit.startTime && habit.endTime ? `${habit.startTime} - ${habit.endTime}` : "Any time"}
                            </span>
                        </div>
                    </div>
                </div>

                {habit.dailyStatuses.map((day, index) => {
                    const dayInfo = weekDays[index];
                    const isToday = dayInfo?.isToday || false;
                    const isWeekend =
                        dayInfo?.dayName === "Sat" ||
                        dayInfo?.dayName === "Sun";

                    const [y, m, d] = day.date.split("-").map(Number);
                    const localDayIndex = new Date(
                        y,
                        m - 1,
                        d
                    ).getDay();

                    const dayKeys = [
                        "sunday",
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                    ] as const;
                    const dayKey = dayKeys[localDayIndex];

                    const isScheduled = habit.frequency
                        ? habit.frequency[dayKey]
                        : true;

                    let cellClass =
                        "p-3 border-l border-border-light dark:border-border-dark flex items-center justify-center";
                    if (isWeekend) {
                        cellClass +=
                            " bg-slate-100/50 dark:bg-slate-900/50";
                    }
                    if (isToday) {
                        cellClass += " bg-primary/5 dark:bg-primary/10";
                    }

                    return (
                        <div key={day.date} className={cellClass}>
                            {isScheduled ? (
                                renderDayCell(
                                    day.status,
                                    visual.colorClass,
                                    visual.bgClass,
                                    isToday,
                                    (e) =>
                                        handleToggle(
                                            habit.id,
                                            day.date,
                                            e
                                        ),
                                    visual.baseColor
                                )
                            ) : (
                                <div
                                    className="w-8 h-8 flex items-center justify-center cursor-help"
                                    title="Not scheduled for this day"
                                >
                                    <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="p-3 border-l border-border-light dark:border-border-dark flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-400">
                        {habit.weeklyProgress}/{habit.goal}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
            <div className="grid grid-cols-[minmax(220px,1.8fr)_repeat(7,1fr)_80px] border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider relative">
                <div className="p-4 flex items-center justify-between group">
                    <span>Habit</span>
                    {/* Settings Dropdown */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            title="Table Options"
                        >
                            <Icon name="tune" className="text-sm" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 z-50 p-1 overflow-hidden">
                                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    View Options
                                </div>
                                <button
                                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md transition-colors"
                                    onClick={() => setIsGrouped(!isGrouped)}
                                >
                                    <span>Group by Category</span>
                                    <div className={cn(
                                        "w-8 h-4 rounded-full transition-colors relative border border-transparent",
                                        isGrouped ? "bg-indigo-500 dark:bg-indigo-400" : "bg-slate-200 dark:bg-slate-600"
                                    )}>
                                        <div className={cn(
                                            "absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200",
                                            isGrouped ? "translate-x-4" : "translate-x-0"
                                        )} />
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {weekDays.map((day) => {
                    const isToday = day.isToday;
                    let headerClass =
                        "p-3 text-center border-l border-border-light dark:border-border-dark";
                    if (isToday) {
                        headerClass +=
                            " bg-primary/5 dark:bg-primary/10 relative";
                    }

                    return (
                        <div key={day.fullDate} className={headerClass}>
                            <div
                                className={`opacity-70 ${isToday
                                    ? "text-primary dark:text-primary-dark"
                                    : ""
                                    }`}
                            >
                                {day.dayName}
                            </div>
                            <div
                                className={`${isToday
                                    ? "text-primary dark:text-primary-dark"
                                    : "text-slate-900 dark:text-white"
                                    } text-sm font-bold mt-1`}
                            >
                                {day.date}
                            </div>
                            {isToday && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                            )}
                        </div>
                    );
                })}

                <div className="p-4 text-center border-l border-border-light dark:border-border-dark flex items-center justify-center">
                    Goal
                </div>
            </div>
            <div className="divide-y divide-border-light dark:divide-border-dark">
                {isGrouped ? (
                    Object.entries(groupedHabits).map(([category, items]) => (
                        <React.Fragment key={category}>
                            {/* Category Header */}
                            <div className="col-span-full bg-slate-50/30 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                                <div className="px-4 py-1.5 flex items-center gap-2">
                                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        {category}
                                    </span>
                                    <span className="text-[9px] text-slate-400">({items.length})</span>
                                </div>
                            </div>
                            {items.map(habit => renderHabitRow(habit))}
                        </React.Fragment>
                    ))
                ) : (
                    habits.map((habit) => renderHabitRow(habit))
                )}
            </div>
        </div>
    );
}
