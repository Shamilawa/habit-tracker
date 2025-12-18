import { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

export interface IDay {
    date: string; // YYYY-MM-DD
    userId: string;
    content: string; // HTML content from Tiptap or JSON
}

export const dayConverter = {
    toFirestore(day: IDay): DocumentData {
        return {
            date: day.date,
            userId: day.userId,
            content: day.content,
        };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot
    ): IDay {
        const data = snapshot.data();
        return {
            date: data.date,
            userId: data.userId,
            content: data.content,
        };
    },
};
