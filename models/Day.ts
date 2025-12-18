import { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

export interface IDay {
    date: string; // YYYY-MM-DD
    content: string; // HTML content from Tiptap or JSON
}

export const dayConverter = {
    toFirestore(day: IDay): DocumentData {
        return {
            date: day.date,
            content: day.content,
        };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot
    ): IDay {
        const data = snapshot.data();
        return {
            date: data.date,
            content: data.content,
        };
    },
};
