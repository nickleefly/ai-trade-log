"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface EconomicEvent {
    id: string;
    date: string;
    time: string;
    name: string;
    impact: "low" | "medium" | "high";
    country: string;
    actual?: string;
    forecast?: string;
    previous?: string;
    currency?: string;
}

export function EconomicCalendar() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState<EconomicEvent[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEconomicEvents();
    }, [selectedDate]);

    const fetchEconomicEvents = async () => {
        setLoading(true);
        try {
            const monthStr = format(selectedDate, "yyyy-MM");
            // Using mock data for now - could integrate with real API
            const mockEvents = getMockEvents(monthStr);
            setEvents(mockEvents);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    const dayEvents = events.filter((e) => e.date === selectedDateStr);

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case "high":
                return "bg-red-500 text-white";
            case "medium":
                return "bg-amber-500 text-white";
            case "low":
                return "bg-green-500 text-white";
            default:
                return "bg-gray-500 text-white";
        }
    };

    const getImpactLabel = (impact: string) => {
        switch (impact) {
            case "high":
                return "High";
            case "medium":
                return "Med";
            case "low":
                return "Low";
            default:
                return "Unknown";
        }
    };

    return (
        <div className="grid md:grid-cols-3 gap-6">
            {/* Calendar Grid */}
            <Card className="md:col-span-2">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() =>
                                setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))
                            }
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {format(selectedDate, "MMMM yyyy")}
                        </h3>
                        <button
                            onClick={() =>
                                setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))
                            }
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs font-medium text-gray-500 py-2"
                            >
                                {day}
                            </div>
                        ))}

                        {weekDays.map((day) => {
                            const dayStr = format(day, "yyyy-MM-dd");
                            const hasEvents = events.filter((e) => e.date === dayStr);
                            const isSelected = isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, new Date());
                            const highImpactEvents = hasEvents.filter((e) => e.impact === "high").length;

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`aspect-square p-1 text-sm rounded-lg transition-all hover:ring-2 hover:ring-primary ${
                                        isSelected
                                            ? "bg-primary text-primary-foreground ring-2 ring-primary"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                    } ${isToday && !isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
                                >
                                    {format(day, "d")}
                                    {hasEvents.length > 0 && (
                                        <div className="flex justify-center gap-0.5 mt-0.5">
                                            {highImpactEvents > 0 && (
                                                <div className="w-1 h-1 rounded-full bg-red-500" />
                                            )}
                                            {hasEvents.length > highImpactEvents && (
                                                <div className="w-1 h-1 rounded-full bg-amber-500" />
                                            )}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Events List */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            {format(selectedDate, "MMM dd, yyyy")}
                        </h3>
                    </div>

                    {loading ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
                    ) : dayEvents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="mb-1">No events scheduled</p>
                            <p className="text-sm">This date has no economic events</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {dayEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-900">{event.name}</span>
                                                <Badge
                                                    className={`text-white text-xs ${getImpactColor(event.impact)}`}
                                                >
                                                    {getImpactLabel(event.impact)}
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {event.time} · {event.country}
                                                {event.currency && ` · ${event.currency}`}
                                            </div>
                                        </div>
                                    </div>

                                    {(event.actual || event.forecast || event.previous) && (
                                        <div className="grid grid-cols-3 gap-2 text-xs mt-2 pt-2 border-t">
                                            {event.actual && (
                                                <div>
                                                    <span className="text-gray-500">Actual:</span>{" "}
                                                    <span className="font-medium text-gray-900">{event.actual}</span>
                                                </div>
                                            )}
                                            {event.forecast && (
                                                <div>
                                                    <span className="text-gray-500">Forecast:</span>{" "}
                                                    <span className="font-medium text-gray-900">{event.forecast}</span>
                                                </div>
                                            )}
                                            {event.previous && (
                                                <div>
                                                    <span className="text-gray-500">Previous:</span>{" "}
                                                    <span className="font-medium text-gray-900">{event.previous}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Mock economic events data
function getMockEvents(month: string): EconomicEvent[] {
    // Return some realistic economic events for the month
    const events: EconomicEvent[] = [
        {
            id: "1",
            date: `${month}-01`,
            time: "08:30",
            name: "Non-Farm Payrolls",
            impact: "high",
            country: "US",
            currency: "USD",
            forecast: "200K",
            previous: "175K",
        },
        {
            id: "2",
            date: `${month}-01`,
            time: "10:00",
            name: "ISM Manufacturing PMI",
            impact: "medium",
            country: "US",
            currency: "USD",
            forecast: "50.5",
            previous: "49.8",
        },
        {
            id: "3",
            date: `${month}-03`,
            time: "02:00",
            name: "ECB Interest Rate Decision",
            impact: "high",
            country: "EU",
            currency: "EUR",
            forecast: "4.00%",
            previous: "4.00%",
        },
        {
            id: "4",
            date: `${month}-05`,
            time: "08:30",
            name: "ADP Employment Report",
            impact: "medium",
            country: "US",
            currency: "USD",
            forecast: "180K",
            previous: "165K",
        },
        {
            id: "5",
            date: `${month}-07`,
            time: "14:00",
            name: "BOC Interest Rate Decision",
            impact: "high",
            country: "CA",
            currency: "CAD",
            forecast: "5.00%",
            previous: "5.00%",
        },
        {
            id: "6",
            date: `${month}-10`,
            time: "10:30",
            name: "CPI (YoY)",
            impact: "high",
            country: "US",
            currency: "USD",
            forecast: "3.2%",
            previous: "3.1%",
        },
        {
            id: "7",
            date: `${month}-15`,
            time: "08:30",
            name: "Retail Sales (MoM)",
            impact: "medium",
            country: "US",
            currency: "USD",
            forecast: "0.4%",
            previous: "0.3%",
        },
        {
            id: "8",
            date: `${month}-20`,
            time: "03:00",
            name: "FOMC Meeting Minutes",
            impact: "high",
            country: "US",
            currency: "USD",
        },
    ];

    // Filter events to only return those within the month
    return events.filter((e) => e.date.startsWith(month));
}
