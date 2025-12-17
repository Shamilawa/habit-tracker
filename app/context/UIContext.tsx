"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UIContextType {
    isCreateHabitModalOpen: boolean;
    openCreateHabitModal: () => void;
    closeCreateHabitModal: () => void;
    lastUpdated: number;
    triggerRefresh: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
    const [isCreateHabitModalOpen, setIsCreateHabitModalOpen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(0); // Initialize with 0 or a fixed timestamp

    const openCreateHabitModal = () => setIsCreateHabitModalOpen(true);
    const closeCreateHabitModal = () => setIsCreateHabitModalOpen(false);
    const triggerRefresh = () => setLastUpdated(Date.now());

    return (
        <UIContext.Provider
            value={{
                isCreateHabitModalOpen,
                openCreateHabitModal,
                closeCreateHabitModal,
                lastUpdated,
                triggerRefresh,
            }}
        >
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error("useUI must be used within a UIProvider");
    }
    return context;
}
