"use client";

import { useState, useEffect } from "react";
import { useUI } from "../context/UIContext";
import { Habit } from "@/app/types/habit"; // Import Habit type
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

import { ICONS, COLORS } from "@/app/utils/constants";

// Removed static CATEGORIES constant, using dynamic state
const DEFAULT_CATEGORIES = ["Health", "Learning", "Productivity", "Wellness", "Other"];

import { ICategory } from "@/models/Category"; // Assuming shared model or define locally if strictly frontend

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
    const { user } = useAuth();

    // Use internal close if onClose is not provided (for global usage)
    const handleClose = onClose || closeCreateHabitModal;

    // Determine if modal should be shown
    // 1. Global context is true
    // 2. isOpen prop is true (managed externally)
    const shouldShow = isCreateHabitModalOpen || isOpen;

    // Form State
    const [name, setName] = useState("");

    // Category State
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [categoryMode, setCategoryMode] = useState<"select" | "input">("select");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [customCategory, setCustomCategory] = useState("");

    // Visuals State (Now tied to Category creation mainly)
    const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            if (!user) return;
            setIsLoadingCategories(true);
            try {
                const token = await user.getIdToken();
                const res = await fetch("/api/categories", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to load categories", error);
            } finally {
                setIsLoadingCategories(false);
            }
        };

        if (shouldShow) {
            fetchCategories();
        }
    }, [shouldShow, user]);

    // Set initial category selection when editing or when categories load
    useEffect(() => {
        if (initialData && categories.length > 0) {
            // Try to find category by ID first, then by name (migration case)
            const cat = categories.find(c => c.id === initialData.categoryId) || categories.find(c => c.name === initialData.category);
            if (cat) {
                setCategoryMode("select");
                setSelectedCategoryId(cat.id || "");
                // If the category has icon/color, we might want to "show" them, but we don't edit them for the habit anymore unless we edit the category (which is out of scope here?)
                // Actually, for this task, "Habit" takes "Category's" visual.
            } else {
                setCategoryMode("input");
                setCustomCategory(initialData.category);
                // If it was a custom legacy category with no ID, we might default visuals to what the habit had
                setSelectedIcon(initialData.icon || ICONS[0]);
                const foundColor = COLORS.find(c => c.textClass === initialData.iconColorClass);
                if (foundColor) setSelectedColor(foundColor);
            }
        } else if (!initialData && categories.length > 0 && !selectedCategoryId) {
            // Default to first category if creating new
            setSelectedCategoryId(categories[0].id || "");
        }
    }, [initialData, categories, shouldShow]);

    // Time State
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    // Goal State (Day Selection)
    const [selectedDays, setSelectedDays] = useState<boolean[]>(
        Array(7).fill(true)
    ); // Default all days

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Effect to populate form when initialData changes (Edit Mode)
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);

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

            setStartTime(initialData.startTime || "");
            setEndTime(initialData.endTime || "");
        } else if (shouldShow && !initialData) {
            // Reset logic
        }
    }, [initialData, isCreateHabitModalOpen, isOpen]);

    // Reset when opening in CREATE mode (no initialData)
    useEffect(() => {
        if (shouldShow && !initialData) {
            setName("");
            setCategoryMode("select");
            if (categories.length > 0) setSelectedCategoryId(categories[0].id || "");
            else setCategoryMode("input");
            setSelectedDays(Array(7).fill(true));
            // Reset visuals to default
            setSelectedIcon(ICONS[0]);
            setSelectedColor(COLORS[0]);
            setStartTime("");
            setEndTime("");
        }
    }, [shouldShow, initialData]);

    if (!shouldShow) return null;

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === "ADD_NEW") {
            setCategoryMode("input");
            setCustomCategory("");
            // Reset visuals for new category creation
            setSelectedIcon(ICONS[0]);
            setSelectedColor(COLORS[0]);
        } else {
            setCategoryMode("select");
            setSelectedCategoryId(e.target.value);
        }
    };

    const toggleDay = (index: number) => {
        const newDays = [...selectedDays];
        newDays[index] = !newDays[index];
        setSelectedDays(newDays);
    };

    // Helper to get current display visuals
    const getCurrentVisuals = () => {
        if (categoryMode === "select") {
            const cat = categories.find(c => c.id === selectedCategoryId);
            if (cat) {
                return {
                    icon: selectedIcon, // Icon is always per-habit now
                    color: (COLORS.find(c => c.name === cat.color) || COLORS[0])
                };
            }
        }
        return { icon: selectedIcon, color: selectedColor };
    };

    const currentVisuals = getCurrentVisuals();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const token = await user?.getIdToken();

        let finalCategoryId = selectedCategoryId;
        let finalCategoryName = "";
        let finalIcon = selectedIcon;
        let finalColor = selectedColor;

        // If creating new category
        if (categoryMode === "input") {
            if (!user || !token) return;
            try {
                // Save ONLY Color (removed icon)
                const res = await fetch("/api/categories", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: customCategory,
                        color: selectedColor.name
                    })
                });
                if (!res.ok) throw new Error("Failed to create category");
                const newCat = await res.json();
                finalCategoryId = newCat.id;
                finalCategoryName = newCat.name;

                // Color comes from new category (which is selectedColor)
                finalColor = COLORS.find(c => c.name === newCat.color) || selectedColor;

            } catch (err) {
                toast.error("Failed to create new category");
                setIsSubmitting(false);
                return;
            }
        } else {
            const selectedCat = categories.find(c => c.id === selectedCategoryId);
            if (selectedCat) {
                finalCategoryName = selectedCat.name;
                finalCategoryId = selectedCat.id!;
                finalColor = COLORS.find(c => c.name === selectedCat.color) || COLORS[0];
            }
        }

        // Icon is ALWAYS selectedIcon (Habit Level)
        finalIcon = selectedIcon;

        const goal = selectedDays.filter((d) => d).length;

        const frequency = {
            monday: selectedDays[0],
            tuesday: selectedDays[1],
            wednesday: selectedDays[2],
            thursday: selectedDays[3],
            friday: selectedDays[4],
            saturday: selectedDays[5],
            sunday: selectedDays[6],
        };

        if (!name || (categoryMode === "input" && !finalCategoryName && !customCategory) || goal === 0) {
            toast.error("Please fill in all fields");
            setIsSubmitting(false);
            return;
        }

        const habitData = {
            name,
            category: finalCategoryName,
            categoryId: finalCategoryId,
            goal,
            frequency,
            icon: finalIcon,
            iconColorClass: finalColor.textClass,
            iconBgClass: finalColor.bgClass,
            startTime,
            endTime,
        };

        try {
            if (!user) {
                toast.error("You must be logged in");
                return;
            }
            const token = await user.getIdToken();
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };

            let res;
            if (initialData && initialData._id) {
                // UPDATE
                res = await fetch(`/api/habits/${initialData._id}`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(habitData),
                });
            } else {
                // CREATE
                res = await fetch("/api/habits", {
                    method: "POST",
                    headers,
                    body: JSON.stringify(habitData),
                });
            }

            if (!res.ok) throw new Error("Failed to save habit");

            triggerRefresh();
            if (onSuccess) onSuccess();
            handleClose();

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
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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

                    {/* Icon Selection (Per Habit) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Icon</label>
                        <div className="grid grid-cols-8 gap-2">
                            {ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setSelectedIcon(icon)}
                                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${selectedIcon === icon
                                        ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-600"
                                        : "bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    <span className="material-icons-round text-xl">
                                        {icon}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Category
                        </label>
                        {categoryMode === "select" ? (
                            <div className="space-y-3">
                                <select
                                    value={selectedCategoryId}
                                    onChange={handleCategoryChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                    <option value="ADD_NEW">+ Add new...</option>
                                </select>

                                {/* Preview of selected category color */}
                                {selectedCategoryId && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentVisuals.color.bgClass}`}>
                                            <div className={`w-4 h-4 rounded-full ${currentVisuals.color.class}`} />
                                        </div>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Category Color: {currentVisuals.color.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customCategory}
                                        onChange={(e) =>
                                            setCustomCategory(e.target.value)
                                        }
                                        placeholder="Enter new category name"
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

                                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Category Color
                                    </label>

                                    {/* Color Selection for New Category */}
                                    <div>
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
                                </div>
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

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Start Time <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                End Time <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
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
            </div >
        </div >
    );
}
