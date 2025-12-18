"use client";

export default function ThemeToggle() {
    const toggleTheme = () => {
        document.documentElement.classList.toggle("dark");
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
            <span className="material-icons-round text-xl !block dark:!hidden">
                dark_mode
            </span>
            <span className="material-icons-round text-xl !hidden dark:!block">
                light_mode
            </span>
        </button>
    );
}
