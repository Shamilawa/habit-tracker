import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDay extends Document {
    date: string; // YYYY-MM-DD
    content: string; // HTML content from Tiptap or JSON
}

const DaySchema: Schema = new Schema(
    {
        date: { type: String, required: true, unique: true },
        content: { type: String, default: "" },
    },
    { timestamps: true }
);

// Force model recompilation in dev to pick up schema changes
if (process.env.NODE_ENV === "development" && mongoose.models.Day) {
    delete mongoose.models.Day;
}

const Day: Model<IDay> =
    mongoose.models.Day || mongoose.model<IDay>("Day", DaySchema);

export default Day;
