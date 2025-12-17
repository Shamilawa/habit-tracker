import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHabit extends Document {
    name: string;
    category: string;
    icon: string;
    iconColorClass: string;
    iconBgClass: string;
    goal: number;
    frequency: {
        sunday: boolean;
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
    };
    history: {
        date: string; // YYYY-MM-DD
        status: "completed" | "failed" | "pending" | "none";
    }[];
}

const HabitSchema: Schema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    icon: { type: String, required: true },
    iconColorClass: { type: String, required: true },
    iconBgClass: { type: String, required: true },
    goal: { type: Number, required: true },
    frequency: {
        sunday: { type: Boolean, default: true },
        monday: { type: Boolean, default: true },
        tuesday: { type: Boolean, default: true },
        wednesday: { type: Boolean, default: true },
        thursday: { type: Boolean, default: true },
        friday: { type: Boolean, default: true },
        saturday: { type: Boolean, default: true },
    },
    history: [
        {
            date: { type: String, required: true },
            status: {
                type: String,
                required: true,
                enum: ["completed", "failed", "pending", "none"],
            },
        },
    ],
});

// Force model recompilation in dev to pick up schema changes
if (process.env.NODE_ENV === "development" && mongoose.models.Habit) {
    delete mongoose.models.Habit;
}

const Habit: Model<IHabit> =
    mongoose.models.Habit || mongoose.model<IHabit>("Habit", HabitSchema);

export default Habit;
