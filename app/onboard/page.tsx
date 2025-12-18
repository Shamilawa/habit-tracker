"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Icon from "../components/ui/Icon";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { name: "Health", icon: "directions_run", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/50" },
    { name: "Learning", icon: "menu_book", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/50" },
    { name: "Productivity", icon: "laptop_mac", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/50" },
    { name: "Wellness", icon: "self_improvement", color: "text-teal-600", bg: "bg-teal-100 dark:bg-teal-900/50" },
    { name: "Finance", icon: "attach_money", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/50" },
    { name: "Social", icon: "groups", color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/50" },
];

export default function Onboard() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        category: null as typeof CATEGORIES[0] | null,
        goal: 1,
        frequency: {
            sunday: true,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
        },
    });

    const handleNext = () => {
        if (step === 1 && (!formData.name || !formData.category)) {
            toast.error("Please fill in all fields");
            return;
        }
        setStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.category) return;

        setIsLoading(true);
        try {
            const newHabit = {
                name: formData.name,
                category: formData.category.name,
                icon: formData.category.icon,
                iconColorClass: `${formData.category.color} dark:${formData.category.color.replace('600', '400')}`,
                iconBgClass: formData.category.bg,
                goal: formData.goal,
                frequency: formData.frequency,
                history: []
            };

            const res = await fetch("/api/habits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newHabit),
            });

            if (!res.ok) throw new Error("Failed to create habit");

            toast.success("All set! Let's start your journey.");
            router.push("/");
        } catch (error) {
            console.error("Error creating habit:", error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDay = (day: string) => {
        setFormData(prev => ({
            ...prev,
            frequency: {
                ...prev.frequency,
                [day]: !(prev.frequency as any)[day]
            }
        }));
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-3xl" />

            <div className="max-w-xl w-full relative z-10">
                {/* Stepper Progress */}
                {step > 0 && (
                    <div className="mb-8 flex items-center gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500",
                                i <= step ? "bg-primary dark:bg-primary-dark" : "bg-slate-200 dark:bg-slate-800"
                            )} />
                        ))}
                    </div>
                )}

                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-xl rounded-2xl p-8 md:p-12 transition-all duration-500">

                    {/* STEP 0: WELCOME */}
                    {step === 0 && (
                        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-dark rounded-full flex items-center justify-center mx-auto mb-6">
                                <Icon name="rocket_launch" className="text-4xl" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome to Your Journey</h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                                Small habits, when consistent, lead to massive results. Let's setup your first habit to get you started.
                            </p>
                            <button
                                onClick={() => setStep(1)}
                                className="w-full py-4 bg-primary dark:bg-primary-dark hover:opacity-90 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-primary/30 mt-8"
                            >
                                Start Setup
                            </button>
                        </div>
                    )}

                    {/* STEP 1: IDENTITY */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What do you want to achieve?</h2>
                                <p className="text-slate-500 dark:text-slate-400">Name your habit and pick a category.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Habit Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Morning Jog, Read a Book"
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none transition-all"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.name}
                                                onClick={() => setFormData({ ...formData, category: cat })}
                                                className={cn(
                                                    "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                                    formData.category?.name === cat.name
                                                        ? "border-primary dark:border-primary-dark bg-primary/5 dark:bg-primary-dark/10 ring-1 ring-primary dark:ring-primary-dark"
                                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-transparent"
                                                )}
                                            >
                                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", cat.bg, cat.color)}>
                                                    <Icon name={cat.icon} className="text-lg" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8 pt-4">
                                <button onClick={handleBack} className="px-6 py-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">Back</button>
                                <button onClick={handleNext} className="flex-1 py-3 bg-primary dark:bg-primary-dark text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition-all">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: STRUCTURE */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Build a consistency</h2>
                                <p className="text-slate-500 dark:text-slate-400">How often do you want to do this?</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Frequency</label>
                                <div className="flex justify-between gap-1">
                                    {Object.keys(formData.frequency).map((day) => {
                                        const isSelected = (formData.frequency as any)[day];
                                        return (
                                            <button
                                                key={day}
                                                onClick={() => toggleDay(day)}
                                                className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold uppercase transition-all",
                                                    isSelected
                                                        ? "bg-primary dark:bg-primary-dark text-white shadow-md scale-105"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                )}
                                                title={day}
                                            >
                                                {day.substring(0, 1)}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Daily Goal (Minutes/Times)</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, goal: Math.max(1, prev.goal - 1) }))}
                                        className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-2xl"
                                    >-</button>
                                    <div className="flex-1 text-center font-mono text-3xl font-bold text-slate-800 dark:text-slate-200">
                                        {formData.goal}
                                    </div>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, goal: prev.goal + 1 }))}
                                        className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-2xl"
                                    >+</button>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8 pt-4">
                                <button onClick={handleBack} className="px-6 py-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">Back</button>
                                <button onClick={handleNext} className="flex-1 py-3 bg-primary dark:bg-primary-dark text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition-all">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: COMMITMENT */}
                    {step === 3 && (
                        <div className="text-center space-y-6 animate-in slide-in-from-right duration-300">
                            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <Icon name="check_circle" className="text-5xl" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ready to go!</h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    You are committing to <strong>{formData.name}</strong> <br />
                                    <span className="text-primary dark:text-primary-dark font-medium">
                                        {Object.values(formData.frequency).filter(Boolean).length === 7 ? "Every day" : `${Object.values(formData.frequency).filter(Boolean).length} days a week`}
                                    </span>.
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl text-left border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", formData.category?.bg, formData.category?.color)}>
                                        <Icon name={formData.category?.icon || "star"} className="text-2xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{formData.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{formData.category?.name} • Target: {formData.goal}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full py-4 bg-primary dark:bg-primary-dark hover:opacity-90 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-primary/30 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? "Creating..." : "Create My First Habit"}
                            </button>
                            <button onClick={handleBack} className="text-slate-400 hover:text-slate-600 text-sm mt-4">Go Back</button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
