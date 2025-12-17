import React from "react";
import Icon from "./ui/Icon";

interface WeekNavigationProps {
    label: string;
    onPrev?: () => void;
    onNext?: () => void;
}

export default function WeekNavigation({
    label,
    onPrev,
    onNext,
}: WeekNavigationProps) {
    return (
        <div className="flex items-center bg-white dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark p-1 shadow-sm">
            <button
                onClick={onPrev}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
                <Icon name="chevron_left" className="text-lg" />
            </button>
            <span className="px-4 text-sm font-medium text-slate-700 dark:text-slate-200 min-w-[140px] text-center">
                {label}
            </span>
            <button
                onClick={onNext}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
                <Icon name="chevron_right" className="text-lg" />
            </button>
        </div>
    );
}
