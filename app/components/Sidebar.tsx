"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const NAV_SECTIONS = [
    {
        title: "Overview",
        items: [
            {
                name: "Today",
                icon: "today",
                href: "/",
            },
            {
                name: "Dashboard",
                icon: "dashboard",
                href: "/dashboard", // Placeholder, defaulting to non-active usually unless matched
            },
            {
                name: "Weekly Tracker",
                icon: "calendar_view_week",
                href: "/weekly",
            },
            {
                name: "Analytics",
                icon: "analytics",
                href: "/analytics",
            },
        ],
    },
    {
        title: "Management",
        items: [
            {
                name: "All Habits",
                icon: "list_alt",
                href: "/management/habits",
            },
            {
                name: "Categories",
                icon: "category",
                href: "/categories",
            },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const isActive = (href: string) => {
        if (href === "/" && pathname === "/") return true;
        if (href !== "/" && pathname.startsWith(href)) return true; // Simple prefix match for sub-routes
        return false;
    };

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark transition-colors duration-300 z-20">
            <div className="h-[64px] shrink-0 flex items-center px-6 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center gap-2 text-primary dark:text-primary-dark font-bold text-xl tracking-tight">
                    <span className="material-icons-round text-2xl">
                        insights
                    </span>
                    <span>HabitFlow</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {NAV_SECTIONS.map((section, sectionIdx) => (
                    <div key={section.title}>
                        {sectionIdx > 0 && (
                            <div className="my-4 border-t border-border-light dark:border-border-dark"></div>
                        )}
                        <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {section.title}
                        </div>
                        {section.items.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors group ${active
                                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark ring-1 ring-inset ring-primary/20"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100"
                                        }`}
                                >
                                    <span
                                        className={`material-icons-round ${active
                                            ? ""
                                            : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                            }`}
                                    >
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/50">
                {user ? (
                    <div className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors">
                        <img
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600"
                            src={user.photoURL || "https://ui-avatars.com/api/?name=" + user.displayName}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {user.displayName || user.email?.split("@")[0]}
                            </p>
                            <button
                                onClick={() => logout()}
                                className="text-xs text-red-500 hover:text-red-600 hover:underline truncate text-left"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 w-full p-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
                    >
                        <span>Sign In</span>
                    </Link>
                )}
            </div>
        </aside>
    );
}
