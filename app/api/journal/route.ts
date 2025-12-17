import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Day from "@/models/Day";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");

        if (!date) {
            return NextResponse.json(
                { error: "Date is required" },
                { status: 400 }
            );
        }

        const day = await Day.findOne({ date });

        return NextResponse.json({
            date,
            content: day ? day.content : "",
        });
    } catch (error) {
        console.error("Error fetching journal entry:", error);
        return NextResponse.json(
            { error: "Failed to fetch journal entry" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { date, content } = body;

        if (!date) {
            return NextResponse.json(
                { error: "Date is required" },
                { status: 400 }
            );
        }

        const day = await Day.findOneAndUpdate(
            { date },
            { content },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(day);
    } catch (error) {
        console.error("Error saving journal entry:", error);
        return NextResponse.json(
            { error: "Failed to save journal entry" },
            { status: 500 }
        );
    }
}
