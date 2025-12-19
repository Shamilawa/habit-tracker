import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { categoryConverter } from "@/models/Category";
import { habitConverter } from "@/models/Habit";
import { getAuth } from "firebase-admin/auth";

const verifyToken = async (request: Request) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.split("Bearer ")[1];
    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
};

export async function POST(request: Request) {
    try {
        const userId = await verifyToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const habitsRef = db.collection("habits").withConverter(habitConverter);
        const categoriesRef = db.collection("categories").withConverter(categoryConverter);

        const habitsSnapshot = await habitsRef.where("userId", "==", userId).get();
        const existingCategoriesSnapshot = await categoriesRef.where("userId", "==", userId).get();

        const existingCategories = existingCategoriesSnapshot.docs.map(doc => doc.data());
        const existingCategoryNames = new Set(existingCategories.map(c => c.name));

        const batch = db.batch();
        let createdCount = 0;
        let updatedCount = 0;

        // Map of category name to category ID
        const categoryMap = new Map<string, string>();
        existingCategories.forEach(c => {
            if (c.id) categoryMap.set(c.name, c.id);
        });

        // Loop through habits to find categories to create
        const habits = habitsSnapshot.docs.map(doc => ({ ref: doc.ref, data: doc.data() }));

        // 1. Create missing categories
        for (const habit of habits) {
            const catName = habit.data.category;
            if (catName && !existingCategoryNames.has(catName) && !categoryMap.has(catName)) {
                // Create new category
                const newCatRef = categoriesRef.doc();
                batch.set(newCatRef, {
                    userId,
                    name: catName,
                    isDefault: ["Health", "Learning", "Productivity", "Wellness", "Other"].includes(catName) // simplistic default check
                });
                categoryMap.set(catName, newCatRef.id);
                existingCategoryNames.add(catName); // Prevent duplicates in this run
                createdCount++;
            }
        }

        // 2. Update habits with categoryId
        for (const habit of habits) {
            const catName = habit.data.category;
            const catId = categoryMap.get(catName);

            if (catId && !habit.data.categoryId) {
                batch.update(habit.ref, { categoryId: catId });
                updatedCount++;
            }
        }

        await batch.commit();

        return NextResponse.json({
            success: true,
            message: `Migration complete. Created ${createdCount} categories. Updated ${updatedCount} habits.`
        });

    } catch (error) {
        console.error("Error migrating categories:", error);
        return NextResponse.json(
            { error: "Failed to migrate categories" },
            { status: 500 }
        );
    }
}
