"use client";

import ThemeToggle from "./ThemeToggle";
import { useUI } from "../context/UIContext";

import { usePathname } from "next/navigation";

export default function Header() {
    const { openCreateHabitModal } = useUI();
    const pathname = usePathname();

    const getPageTitle = () => {
        if (pathname === "/") return "Daily View";
        if (pathname === "/weekly") return "Weekly Tracker";
        if (pathname === "/management/habits") return "All Habits";
        if (pathname === "/dashboard") return "Dashboard";
        return "Overview";
    };

    return (
        <header className="h-[64px] shrink-0 flex items-center justify-between px-6 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark z-10">
            <div className="flex items-center gap-4">
                <button className="md:hidden p-1 text-slate-500 hover:text-primary">
                    <span className="material-icons-round">menu</span>
                </button>
                <nav className="flex text-sm text-slate-500 dark:text-slate-400">
                    <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                        Dashboard
                    </span>
                    <span className="mx-2 text-slate-300 dark:text-slate-600">
                        /
                    </span>
                    <span className="text-slate-900 dark:text-white font-medium">
                        {getPageTitle()}
                    </span>
                </nav>
            </div>
            <div className="flex items-center gap-3">
                <button className="flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                    <span className="material-icons-round text-xl">
                        notifications
                    </span>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>

                <ThemeToggle />

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button
                    onClick={openCreateHabitModal}
                    className="bg-primary hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-4 rounded-md shadow-sm shadow-indigo-500/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                    <span className="material-icons-round text-sm">add</span>
                    New Habit
                </button>
            </div>
        </header>
    );
}
