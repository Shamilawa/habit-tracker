import React from "react";

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    labels?: string[];
}

export default function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-between w-full mb-8 relative">
            {/* Trend Line Background */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full z-0" />

            {/* Active Trend Line */}
            <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-300 ease-out"
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />

            {Array.from({ length: totalSteps }).map((_, index) => {
                const stepNum = index + 1;
                const isActive = stepNum <= currentStep;
                const isCurrent = stepNum === currentStep;

                return (
                    <div key={index} className="relative z-10 flex flex-col items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-4 ${isActive
                                    ? "bg-primary border-white dark:border-slate-900 text-white scale-110 shadow-lg shadow-primary/30"
                                    : "bg-slate-200 dark:bg-slate-800 border-white dark:border-slate-900 text-slate-500"
                                }`}
                        >
                            {isActive && !isCurrent ? (
                                <span className="material-icons-round text-sm">check</span>
                            ) : (
                                stepNum
                            )}
                        </div>
                        {labels && labels[index] && (
                            <span
                                className={`absolute -bottom-6 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${isActive ? "text-primary" : "text-slate-400"
                                    }`}
                            >
                                {labels[index]}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
