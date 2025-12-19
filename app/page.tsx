"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Dashboard from "./components/Dashboard";
import { Habit } from "@/app/types/habit";
import Icon from "@/app/components/ui/Icon";

function Loading() {
    return (
        <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
            <div className="animate-spin text-primary">
                <Icon name="loader" className="text-4xl" />
            </div>
        </div>
    );
}

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            const fetchHabits = async () => {
                setFetching(true);
                try {
                    const token = await user.getIdToken();
                    const res = await fetch("/api/habits", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const rawHabits = await res.json();
                        // Transform logic consistent with previous server implementation
                        const transformed: Habit[] = rawHabits.map((h: any) => ({
                            id: h.id || h._id,
                            _id: h.id || h._id,
                            userId: h.userId,
                            name: h.name,
                            category: h.category,
                            categoryId: h.categoryId,
                            icon: h.icon,
                            iconColorClass: h.iconColorClass,
                            iconBgClass: h.iconBgClass,
                            goal: h.goal,
                            startTime: h.startTime,
                            endTime: h.endTime,
                            frequency: h.frequency || {
                                sunday: true, monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true
                            },
                            weeklyProgress: 0,
                            dailyStatuses: h.history ? h.history.map((hist: any) => ({
                                date: hist.date, // YYYY-MM-DD
                                status: hist.status
                            })) : [],
                        }));
                        setHabits(transformed);

                        // If no habits, redirect to onboard
                        if (transformed.length === 0) {
                            router.push("/onboard");
                        }
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setFetching(false);
                }
            };
            fetchHabits();
        } else if (!loading) {
            // No user, not loading -> handled by redirect effect, but stop fetching spinner
            setFetching(false);
        }
    }, [user, loading, router]);

    if (loading || fetching) return <Loading />;

    return <Dashboard initialHabits={habits} />;
}
