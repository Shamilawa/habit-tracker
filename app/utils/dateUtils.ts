export function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function getWeekDays(
    startOfWeek: Date
): { dayName: string; date: number; fullDate: string; isToday: boolean }[] {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);

        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        days.push({
            dayName: dayNames[d.getDay()],
            date: d.getDate(),
            fullDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                2,
                "0"
            )}-${String(d.getDate()).padStart(2, "0")}`,
            isToday: d.getTime() === today.getTime(),
        });
    }
    return days;
}

export function formatDateRange(start: Date, end: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
    };
    return `${start.toLocaleDateString(
        "en-US",
        options
    )} - ${end.toLocaleDateString("en-US", options)}`;
}

export function getWeekNumber(date: Date): number {
    const d = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
