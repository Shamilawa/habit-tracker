"use client";

import { useState, useEffect, useRef } from "react";
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

    // Dropdown State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownSearch, setDropdownSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter categories based on search
    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(dropdownSearch.toLowerCase())
    );

    // Click outside to close standard dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
                setDropdownSearch(cat.name); // Set search to category name
            } else {
                setCategoryMode("input");
                setCustomCategory(initialData.category);
                setSelectedIcon(initialData.icon || ICONS[0]);
                const foundColor = COLORS.find(c => c.textClass === initialData.iconColorClass);
                if (foundColor) setSelectedColor(foundColor);
            }
        } else if (!initialData && categories.length > 0 && !selectedCategoryId) {
            // Default to first category if creating new
            // setSelectedCategoryId(categories[0].id || ""); // Don't auto-select deeply? Maybe just leave empty for search
            // For now, let's keep it clean: no auto-selection, force user to pick?
            // Or select first one for convenience:
            // setSelectedCategoryId(categories[0].id || "");
            // setDropdownSearch(categories[0].name);
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
            setSelectedIcon(initialData.icon || ICONS[0]);

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
            setSelectedCategoryId(""); // Start empty for clean state?
            setDropdownSearch(""); // Clear search

            // Optional: Default to first category if we want to be opinionated
            if (categories.length > 0) {
                setSelectedCategoryId(categories[0].id || "");
                setDropdownSearch(categories[0].name);
            }

            setCategoryMode(categories.length > 0 ? "select" : "input");

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col border border-white/20">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {initialData ? "Edit Habit" : "Create New Habit"}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Build a better version of yourself, one day at a time.
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                    >
                        <span className="material-icons-round text-2xl">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar">
                    {isLoadingCategories ? (
                        <div className="p-8 space-y-8 animate-pulse">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
                                        <div className="h-[50px] w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
                                        <div className="h-[50px] w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="h-32 w-full bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
                            </div>
                            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between">
                                    <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                </div>
                                <div className="flex gap-2">
                                    {Array(7).fill(0).map((_, i) => (
                                        <div key={i} className="flex-1 h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Section 1: Core Info */}
                            <div className="space-y-6">
                                {/* Name & Category Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Habit Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Drink Water"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="space-y-2 relative" ref={dropdownRef}>
                                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Category
                                        </label>
                                        {categoryMode === "select" ? (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={dropdownSearch}
                                                    onChange={(e) => {
                                                        setDropdownSearch(e.target.value);
                                                        setIsDropdownOpen(true);
                                                    }}
                                                    onFocus={() => setIsDropdownOpen(true)}
                                                    placeholder="Select or search category..."
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                    <span className="material-icons-round">expand_more</span>
                                                </div>

                                                {/* Dropdown Menu */}
                                                {isDropdownOpen && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 p-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                                                        {filteredCategories.length > 0 ? (
                                                            filteredCategories.map((c) => (
                                                                <button
                                                                    key={c.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedCategoryId(c.id || "");
                                                                        setDropdownSearch(c.name);
                                                                        setIsDropdownOpen(false);
                                                                    }}
                                                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                                                                >
                                                                    <span className="font-medium text-slate-700 dark:text-slate-200">
                                                                        {c.name}
                                                                    </span>
                                                                    {c.id === selectedCategoryId && (
                                                                        <span className="material-icons-round text-primary text-sm">check</span>
                                                                    )}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="p-4 text-center text-sm text-slate-500">
                                                                No categories found.
                                                            </div>
                                                        )}

                                                        {/* Create New Option */}
                                                        <div className="border-t border-slate-100 dark:border-slate-700/50 mt-1 pt-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setCategoryMode("input");
                                                                    setCustomCategory(dropdownSearch); // Pre-fill with what they typed
                                                                    setIsDropdownOpen(false);
                                                                    // Reset visuals for new category creation
                                                                    setSelectedIcon(ICONS[0]);
                                                                    setSelectedColor(COLORS[0]);
                                                                }}
                                                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2 text-primary font-medium"
                                                            >
                                                                <span className="material-icons-round text-lg">add_circle_outline</span>
                                                                Create "{dropdownSearch || "New"}"
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={customCategory}
                                                    onChange={(e) => setCustomCategory(e.target.value)}
                                                    placeholder="New category name"
                                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCategoryMode("select");
                                                        // Reset search to empty or previous valid selection?
                                                        // Ideally, reset to previous selection if exists, or clear
                                                        setDropdownSearch("");
                                                    }}
                                                    className="px-3 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                >
                                                    <span className="material-icons-round">close</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* New Category Color Picker (Only visible when creating new) */}
                                {categoryMode === "input" && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Choose Category Color
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {COLORS.map((color) => (
                                                <button
                                                    key={color.name}
                                                    type="button"
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedColor.name === color.name
                                                        ? "ring-2 ring-offset-2 ring-primary ring-offset-white dark:ring-offset-slate-900 scale-110"
                                                        : "hover:scale-110"
                                                        }`}
                                                >
                                                    <div className={`w-full h-full rounded-full ${color.class}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Visual Preview Banner */}
                                {(categoryMode === "select" && selectedCategoryId) || categoryMode === "input" ? (
                                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-105 ${currentVisuals.color.bgClass}`}>
                                            <span className={`material-icons-round text-2xl ${currentVisuals.color.textClass}`}>
                                                {selectedIcon}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                                                Visual Preview
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                This is how your habit will appear in the tracker
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {/* Section 2: Icon Selection */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    Choose Icon
                                </label>
                                <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                    {ICONS.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setSelectedIcon(icon)}
                                            className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-200 ${selectedIcon === icon
                                                ? "bg-white dark:bg-slate-800 text-primary shadow-lg scale-110 ring-2 ring-primary/10"
                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
                                                }`}
                                        >
                                            <span className="material-icons-round text-2xl">
                                                {icon}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section 3: Schedule */}
                            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        Frequency
                                    </label>
                                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                                        {selectedDays.filter(Boolean).length} days / week
                                    </span>
                                </div>

                                <div className="flex justify-between gap-2">
                                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                                        (day, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => toggleDay(index)}
                                                className={`flex-1 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all duration-200 ${selectedDays[index]
                                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md transform -translate-y-1"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                    }`}
                                            >
                                                {day.charAt(0)}
                                                <span className="text-[10px] font-normal opacity-70 hidden sm:block">{day}</span>
                                            </button>
                                        )
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Start Time <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            />
                                            <span className="material-icons-round absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">schedule</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            End Time <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            />
                                            <span className="material-icons-round absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">schedule</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 py-3.5 px-6 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] py-3.5 px-6 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-spin material-icons-round text-lg">refresh</span>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons-round">{initialData ? "save" : "add_circle"}</span>
                                            <span>{initialData ? "Save Changes" : "Create Habit"}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div >
        </div >
    );
}
