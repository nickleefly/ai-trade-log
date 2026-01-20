"use client";

import React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
    { name: "Tracking", href: "/private/dashboard" },
    { name: "Backtesting", href: "/private/backtesting" },
    { name: "Mentor", href: "/private/mentor" },
    { name: "University", href: "/private/university" },
];

export default function TopNavBar() {
    const pathname = usePathname();
    const { user } = useUser();

    const getUserDisplayName = () => {
        if (!user) return "";
        return user.firstName ?? user.username ?? "";
    };

    return (
        <header className="h-16 border-b border-zinc-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center space-x-8">
                <nav className="flex items-center space-x-6">
                    {sections.map((section) => {
                        const isActive = pathname.startsWith(section.href.split('/').slice(0, 3).join('/'));
                        return (
                            <Link
                                key={section.name}
                                href={section.href}
                                className={cn(
                                    "text-sm font-medium transition-colors border-b-2 py-5 -mb-5",
                                    isActive
                                        ? "border-blue-600 text-zinc-950"
                                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                                )}
                            >
                                {section.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-zinc-700 hidden sm:block">
                    Hi, {getUserDisplayName()}
                </div>
                <UserButton afterSignOutUrl="/" />
            </div>
        </header>
    );
}
