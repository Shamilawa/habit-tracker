import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { UIProvider } from "./context/UIContext";
import CreateHabitModal from "./components/CreateHabitModal";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Dashboard Weekly Tracker",
    description: "Habit tracker created with Next.js",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
                    rel="stylesheet"
                />
            </head>
            <body
                className={`${inter.variable} bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-body antialiased selection:bg-primary selection:text-white transition-colors duration-300`}
            >
                <UIProvider>
                    <div className="flex h-screen overflow-hidden">
                        <Sidebar />
                        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                            <Header />
                            {children}
                        </main>
                    </div>
                    <CreateHabitModal />
                </UIProvider>
            </body>
        </html>
    );
}
