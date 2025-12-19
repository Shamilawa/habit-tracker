"use client";

import React, { useState, useEffect, useRef } from "react";
import TimeKeeper from "react-timekeeper";
import {
    useFloating,
    useDismiss,
    useInteractions,
    offset,
    flip,
    shift,
    autoUpdate,
} from "@floating-ui/react";

interface TimePickerProps {
    value: string; // "HH:mm" format
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const TimePicker = ({ value, onChange, placeholder = "Select time", className }: TimePickerProps) => {
    // Determine 12h default (just for display if needed, but TimeKeeper works well with 24h internal)
    const [isOpen, setIsOpen] = useState(false);

    // Floating UI setup
    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        middleware: [offset(4), flip(), shift()],
        whileElementsMounted: autoUpdate,
        placement: "bottom-start",
    });

    const dismiss = useDismiss(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

    // Format display string
    const formatDisplay = (val: string) => {
        if (!val) return "";
        const [hours, minutes] = val.split(":");
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    return (
        <div className="relative">
            {/* Input Trigger */}
            <div
                ref={refs.setReference}
                {...getReferenceProps()}
                onClick={() => setIsOpen(!isOpen)}
                className="relative group cursor-pointer"
            >
                <input
                    type="text"
                    value={formatDisplay(value)}
                    readOnly
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer ${className}`}
                />
                <span className="material-icons-round absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    schedule
                </span>
            </div>

            {/* Floating TimeKeeper */}
            {isOpen && (
                <div
                    ref={refs.setFloating}
                    style={{ ...floatingStyles, zIndex: 60 }}
                    {...getFloatingProps()}
                    className="animate-in fade-in zoom-in-95 duration-100"
                >
                    <div className="shadow-2xl rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                        <TimeKeeper
                            time={value || "12:00"}
                            onChange={(data) => {
                                // data.formatted24 is "HH:mm" which matches our internal requirement
                                onChange(data.formatted24);
                            }}
                            switchToMinuteOnHourSelect
                            onDoneClick={() => setIsOpen(false)}
                        // Customizing to match the requested refined look (approximating via existing props/css if possible)
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePicker;
