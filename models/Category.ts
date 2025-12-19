import { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

export interface ICategory {
    id?: string;
    userId: string;
    name: string;
    color?: string; // Optional hex or class
    isDefault?: boolean; // To distinguish user custom vs system default
}

export const categoryConverter = {
    toFirestore(category: ICategory): DocumentData {
        return {
            userId: category.userId,
            name: category.name,
            color: category.color,
            isDefault: category.isDefault
        };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot
    ): ICategory {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            userId: data.userId,
            name: data.name,
            color: data.color,
            isDefault: data.isDefault,
        };
    },
};
