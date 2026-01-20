"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    CalendarDays,
    List,
    BookOpen,
    BarChart3,
    Target,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    FlaskConical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
    { name: 'Dashboard', href: '/private/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', href: '/private/calendar', icon: Calendar },
    { name: 'Day View', href: '/private/day-view', icon: CalendarDays },
    { name: 'Trade View', href: '/private/history', icon: List },
    { name: 'Notebook', href: '/private/notebook', icon: BookOpen },
    { name: 'Reports', href: '/private/statistics', icon: BarChart3 },
    { name: 'Strategies', href: '/private/strategies', icon: Target },
    { name: 'Backtesting', href: '/private/backtesting', icon: FlaskConical },
    { name: 'Progress Tracker', href: '/private/progress-tracker', icon: CheckSquare },
];

export default function SidebarMenu() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = React.useState(false);

    return (
        <div className={cn(
            "flex flex-col h-full bg-zinc-950 text-zinc-400 border-r border-zinc-800 transition-all duration-300",
            collapsed ? "w-16" : "w-64"
        )}>
            <div className="flex items-center justify-between p-4 h-16">
                {!collapsed && (
                    <div className="flex items-center gap-2 font-bold text-white text-lg">
                        <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                            TA
                        </div>
                        <span>TradeAnaly</span>
                    </div>
                )}
                {collapsed && (
                    <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center mx-auto">
                        TZ
                    </div>
                )}
            </div>

            <nav className="flex-1 px-2 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                isActive
                                    ? "bg-zinc-800 text-white"
                                    : "hover:bg-zinc-900 hover:text-zinc-200",
                                collapsed && "justify-center px-0"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-2 border-t border-zinc-800">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full text-zinc-500 hover:text-white hover:bg-zinc-900"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5 ml-auto" />}
                    {!collapsed && <span className="mr-auto ml-2">Collapse</span>}
                </Button>
            </div>
        </div>
    );
}
