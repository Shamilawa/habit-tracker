import React from "react";
import { cn } from "@/lib/utils";

interface TextEditorOverlayPlaceholderProps {
    className?: string;
}

export function TextEditorOverlayPlaceholder({ className }: TextEditorOverlayPlaceholderProps) {
    return (
        <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none p-4 w-[80%] max-w-[600px] z-10 select-none",
            className
        )}>
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-400 dark:text-slate-500 mb-2">
                Anything Worth Remembering Today?
            </h3>
            <p className="text-sm sm:text-base text-slate-300 dark:text-slate-600">
                Small notes today become powerful reflections tomorrow.
            </p>
        </div>
    );
}
