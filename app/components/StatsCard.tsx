import React from "react";
import Icon from "./ui/Icon";

interface StatsCardProps {
    title: string;
    value: string;
    subValue?: string | React.ReactNode;
    icon: string;
    iconColorClass: string;
    iconBgClass: string;
}

export default function StatsCard({
    title,
    value,
    subValue,
    icon,
    iconColorClass,
    iconBgClass,
}: StatsCardProps) {
    return (
        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg border border-border-light dark:border-border-dark shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {title}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {value}
                    </span>
                    {subValue && (
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
                            {subValue}
                        </span>
                    )}
                </div>
            </div>
            <div
                className={`w-10 h-10 rounded-full ${iconBgClass} flex items-center justify-center`}
            >
                <Icon name={icon} className={iconColorClass} />
            </div>
        </div>
    );
}
