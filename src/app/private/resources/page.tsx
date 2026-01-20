"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EconomicCalendar } from "@/components/resources/EconomicCalendar";
import { Newspaper, TrendingUp, BookOpen } from "lucide-react";

export default function ResourcesPage() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
                <p className="text-sm text-gray-500">
                    Market data and economic events to inform your trading
                </p>
            </div>

            <Tabs defaultValue="calendar">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="calendar" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Economic Calendar
                    </TabsTrigger>
                    <TabsTrigger value="news" className="flex items-center gap-2">
                        <Newspaper className="h-4 w-4" />
                        Market News
                    </TabsTrigger>
                    <TabsTrigger value="education" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Education
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="calendar">
                    <EconomicCalendar />
                </TabsContent>

                <TabsContent value="news">
                    <div className="text-center py-12">
                        <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Market News Coming Soon</h3>
                        <p className="text-sm text-gray-500">
                            Real-time market news and analysis feed
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="education">
                    <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Resources Coming Soon</h3>
                        <p className="text-sm text-gray-500">
                            Trading guides, tutorials, and best practices
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
