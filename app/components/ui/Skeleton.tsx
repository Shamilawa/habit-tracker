import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-slate-200 dark:bg-slate-800",
                className
            )}
        />
    );
}

export function HabitSkeleton() {
    return (
        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <Skeleton className="w-8 h-8 rounded-md" />
        </div>
    );
}

export function JournalSkeleton() {
    return (
        <div className="flex flex-col h-full gap-4 p-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <div className="pt-4 space-y-2">
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export function StatsSkeleton() {
    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
    );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <tr className="border-b border-border-light dark:border-border-dark">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-6 py-4">
                    <Skeleton className={cn("h-4", i === 0 ? "w-32" : "w-20")} />
                </td>
            ))}
        </tr>
    );
}

export function TableGridSkeleton() {
    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
            <div className="grid grid-cols-[minmax(180px,1.5fr)_repeat(7,1fr)_80px] border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/50 p-4">
                {Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-12 mx-auto" />
                ))}
            </div>
            <div className="divide-y divide-border-light dark:divide-border-dark">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-[minmax(180px,1.5fr)_repeat(7,1fr)_80px] p-4 items-center">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-2 w-16" />
                            </div>
                        </div>
                        {Array.from({ length: 7 }).map((_, j) => (
                            <div key={j} className="flex justify-center">
                                <Skeleton className="w-8 h-8 rounded-md" />
                            </div>
                        ))}
                        <div className="flex justify-center">
                            <Skeleton className="h-4 w-8" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
