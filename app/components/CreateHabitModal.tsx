"use client";

import { useState, useEffect } from "react";
import { useUI } from "../context/UIContext";
import { Habit } from "@/app/types/habit"; // Import Habit type
import { toast } from "sonner";

const ICONS = [
    "directions_run",
    "menu_book",
    "laptop_mac",
    "self_improvement",
    "water_drop",
    "fitness_center",
    "code",
    "work",
    "bed",
    "local_dining",
    "savings",
    "palette",
    "music_note",
    "psychology",
    "home",
];

const COLORS = [
    {
        name: "Blue",
        class: "bg-blue-500",
        textClass: "text-blue-600 dark:text-blue-400",
        bgClass: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
        name: "Purple",
        class: "bg-purple-500",
        textClass: "text-purple-600 dark:text-purple-400",
        bgClass: "bg-purple-100 dark:bg-purple-900/50",
    },
    {
        name: "Orange",
        class: "bg-orange-500",
        textClass: "text-orange-600 dark:text-orange-400",
        bgClass: "bg-orange-100 dark:bg-orange-900/50",
    },
    {
        name: "Teal",
        class: "bg-teal-500",
        textClass: "text-teal-600 dark:text-teal-400",
        bgClass: "bg-teal-100 dark:bg-teal-900/50",
    },
    {
        name: "Emerald",
        class: "bg-emerald-500",
        textClass: "text-emerald-600 dark:text-emerald-400",
        bgClass: "bg-emerald-100 dark:bg-emerald-900/50",
    },
    {
        name: "Rose",
        class: "bg-rose-500",
        textClass: "text-rose-600 dark:text-rose-400",
        bgClass: "bg-rose-100 dark:bg-rose-900/50",
    },
    {
        name: "Indigo",
        class: "bg-indigo-500",
        textClass: "text-indigo-600 dark:text-indigo-400",
        bgClass: "bg-indigo-100 dark:bg-indigo-900/50",
    },
    {
        name: "Cyan",
        class: "bg-cyan-500",
        textClass: "text-cyan-600 dark:text-cyan-400",
        bgClass: "bg-cyan-100 dark:bg-cyan-900/50",
    },
];

const CATEGORIES = ["Health", "Learning", "Productivity", "Wellness", "Other"];

interface CreateHabitModalProps {
    initialData?: Habit | null; // Optional prop for editing
    isOpen?: boolean; // Optional prop for external control
    onClose?: () => void; // Optional callback for closing specifically in management
    onSuccess?: () => void; // Callback for success (refresh parent)
}

export default function CreateHabitModal({
    initialData,
    isOpen,
    onClose,
    onSuccess,
}: CreateHabitModalProps) {
    const { isCreateHabitModalOpen, closeCreateHabitModal, triggerRefresh } =
        useUI();

    // Use internal close if onClose is not provided (for global usage)
    const handleClose = onClose || closeCreateHabitModal;

    // Determine if modal should be shown
    // 1. Global context is true
    // 2. isOpen prop is true (managed externally)
    const shouldShow = isCreateHabitModalOpen || isOpen;

    // Form State
    const [name, setName] = useState("");

    // Category State
    const [categoryMode, setCategoryMode] = useState<"select" | "input">(
        "select"
    );
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
    const [customCategory, setCustomCategory] = useState("");

    // Goal State (Day Selection)
    const [selectedDays, setSelectedDays] = useState<boolean[]>(
        Array(7).fill(true)
    ); // Default all days

    // Visuals State
    const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Effect to populate form when initialData changes (Edit Mode)
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            if (CATEGORIES.includes(initialData.category)) {
                setCategoryMode("select");
                setSelectedCategory(initialData.category);
            } else {
                setCategoryMode("input");
                setCustomCategory(initialData.category);
            }

            // Map frequency object back to array [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
            if (initialData.frequency) {
                setSelectedDays([
                    initialData.frequency.monday ?? true,
                    initialData.frequency.tuesday ?? true,
                    initialData.frequency.wednesday ?? true,
                    initialData.frequency.thursday ?? true,
                    initialData.frequency.friday ?? true,
                    initialData.frequency.saturday ?? true,
                    initialData.frequency.sunday ?? true,
                ]);
            }

            setSelectedIcon(initialData.icon || ICONS[0]);
            // Find color by matching class or default
            const foundColor = COLORS.find(
                (c) => c.textClass === initialData.iconColorClass
            );
            if (foundColor) setSelectedColor(foundColor);
        } else if (shouldShow && !initialData) {
            // Reset form for create mode ONLY when opening fresh
            // This prevents resetting if we are just re-rendering while open
            // logic: if we just opened and have no data, reset.
            // But checking 'shouldShow' in dependency array is tricky if we want to preserve input during re-renders.
            // Better: Reset on close? or when isCreateHabitModalOpen changes to true?
            // Simplified: If not editing, use default values.
        }
    }, [initialData, isCreateHabitModalOpen, isOpen]); // Added isOpen

    // Reset when opening in CREATE mode (no initialData)
    useEffect(() => {
        if (shouldShow && !initialData) {
            setName("");
            setCategoryMode("select");
            setSelectedCategory(CATEGORIES[0]);
            setSelectedDays(Array(7).fill(true));
            setSelectedIcon(ICONS[0]);
            setSelectedColor(COLORS[0]);
        }
    }, [shouldShow, initialData]);

    if (!shouldShow) return null;

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === "ADD_NEW") {
            setCategoryMode("input");
            setCustomCategory("");
        } else {
            setSelectedCategory(e.target.value);
        }
    };

    const toggleDay = (index: number) => {
        const newDays = [...selectedDays];
        newDays[index] = !newDays[index];
        setSelectedDays(newDays);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const category =
            categoryMode === "select" ? selectedCategory : customCategory;
        const goal = selectedDays.filter((d) => d).length; // Count selected days

        if (!name || (categoryMode === "input" && !category) || goal === 0) {
            toast.error("Please fill in all fields");
            setIsSubmitting(false);
            return;
        }

        const frequency = {
            monday: selectedDays[0],
            tuesday: selectedDays[1],
            wednesday: selectedDays[2],
            thursday: selectedDays[3],
            friday: selectedDays[4],
            saturday: selectedDays[5],
            sunday: selectedDays[6],
        };

        const habitData = {
            name,
            category,
            goal,
            frequency,
            icon: selectedIcon,
            iconColorClass: selectedColor.textClass,
            iconBgClass: selectedColor.bgClass,
        };

        try {
            let res;
            if (initialData && initialData._id) {
                // UPDATE
                res = await fetch(`/api/habits/${initialData._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(habitData),
                });
            } else {
                // CREATE
                res = await fetch("/api/habits", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(habitData),
                });
            }

            if (!res.ok) throw new Error("Failed to save habit");

            triggerRefresh(); // Refresh global context
            if (onSuccess) onSuccess(); // Refresh parent if needed
            handleClose(); // Close modal

            // Clear form if create
            if (!initialData) {
                setName("");
                setSelectedDays(Array(7).fill(true));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save habit");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {initialData ? "Edit Habit" : "Create New Habit"}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Habit Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Drink Water"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Category
                        </label>
                        {categoryMode === "select" ? (
                            <select
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                                <option value="ADD_NEW">+ Add new...</option>
                            </select>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customCategory}
                                    onChange={(e) =>
                                        setCustomCategory(e.target.value)
                                    }
                                    placeholder="Enter new category"
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setCategoryMode("select")}
                                    className="px-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Frequency / Goal */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Frequency{" "}
                            <span className="text-slate-400 font-normal">
                                ({selectedDays.filter(Boolean).length}{" "}
                                days/week)
                            </span>
                        </label>
                        <div className="flex justify-between gap-2">
                            {["M", "T", "W", "T", "F", "S", "S"].map(
                                (day, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => toggleDay(index)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${selectedDays[index]
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            }`}
                                    >
                                        {day}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Icons */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Icon
                        </label>
                        <div className="grid grid-cols-8 gap-2">
                            {ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setSelectedIcon(icon)}
                                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${selectedIcon === icon
                                        ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-600"
                                        : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    <span className="material-icons-round text-xl">
                                        {icon}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Colors */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Color
                        </label>
                        <div className="grid grid-cols-8 gap-2">
                            {COLORS.map((color) => (
                                <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedColor.name === color.name
                                        ? "ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900"
                                        : ""
                                        }`}
                                >
                                    <div
                                        className={`w-full h-full rounded-full ${color.class}`}
                                    ></div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 py-3 px-4 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting
                                ? initialData
                                    ? "Saving..."
                                    : "Creating..."
                                : initialData
                                    ? "Save Changes"
                                    : "Create Habit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
