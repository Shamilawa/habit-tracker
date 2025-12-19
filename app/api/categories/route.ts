import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { categoryConverter } from "@/models/Category";
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

export async function GET(request: Request) {
    try {
        const userId = await verifyToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const categoriesRef = db.collection("categories").withConverter(categoryConverter);
        const snapshot = await categoriesRef.where("userId", "==", userId).get();
        const categories = snapshot.docs.map((doc) => doc.data());

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const userId = await verifyToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, color } = body;

        if (!name || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const categoriesRef = db.collection("categories").withConverter(categoryConverter);

        // added check for duplicate category name for the user?
        // Let's allow simple creation for now, frontend can handle checking or we can add unique constraint (name + userId)

        const newCategory = {
            userId,
            name,
            color,
            isDefault: false
        };

        const docRef = await categoriesRef.add(newCategory);
        const snapshot = await docRef.get();
        return NextResponse.json(snapshot.data(), { status: 201 });

    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            { error: "Failed to create category" },
            { status: 500 }
        );
    }
}
