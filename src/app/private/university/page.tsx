"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Eye, BookOpen, TrendingUp, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";

const categories = [
    { id: "all", name: "All Videos", icon: BookOpen },
    { id: "beginner", name: "Beginner", icon: TrendingUp },
    { id: "technical", name: "Technical Analysis", icon: BookOpen },
    { id: "risk", name: "Risk Management", icon: Shield },
];

const videos = [
    {
        id: 1,
        title: "Introduction to Trading Psychology",
        description: "Learn the fundamentals of trading psychology and how emotions affect your trading decisions.",
        duration: "12:45",
        views: "12.5K",
        category: "beginner",
        thumbnail: "bg-gradient-to-br from-blue-400 to-blue-600",
        level: "Beginner",
    },
    {
        id: 2,
        title: "Candlestick Patterns Explained",
        description: "Master the art of reading candlestick patterns for better trade entries and exits.",
        duration: "18:30",
        views: "8.2K",
        category: "technical",
        thumbnail: "bg-gradient-to-br from-purple-400 to-purple-600",
        level: "Intermediate",
    },
    {
        id: 3,
        title: "Risk Management Essentials",
        description: "Protect your capital with proper position sizing and stop-loss strategies.",
        duration: "15:20",
        views: "15.8K",
        category: "risk",
        thumbnail: "bg-gradient-to-br from-red-400 to-red-600",
        level: "Beginner",
    },
    {
        id: 4,
        title: "Support and Resistance Levels",
        description: "Identify key price levels where reversals are likely to occur.",
        duration: "22:15",
        views: "6.4K",
        category: "technical",
        thumbnail: "bg-gradient-to-br from-green-400 to-green-600",
        level: "Intermediate",
    },
    {
        id: 5,
        title: "Building Your Trading Plan",
        description: "Create a comprehensive trading plan that fits your lifestyle and goals.",
        duration: "25:00",
        views: "9.1K",
        category: "beginner",
        thumbnail: "bg-gradient-to-br from-amber-400 to-amber-600",
        level: "Beginner",
    },
    {
        id: 6,
        title: "Advanced Risk Strategies",
        description: "Take your risk management to the next level with portfolio correlation techniques.",
        duration: "30:45",
        views: "4.7K",
        category: "risk",
        thumbnail: "bg-gradient-to-br from-indigo-400 to-indigo-600",
        level: "Advanced",
    },
    {
        id: 7,
        title: "Moving Averages Strategy",
        description: "Learn how to use moving averages for trend identification and trade signals.",
        duration: "19:30",
        views: "11.2K",
        category: "technical",
        thumbnail: "bg-gradient-to-br from-cyan-400 to-cyan-600",
        level: "Intermediate",
    },
    {
        id: 8,
        title: "Trading Journal Best Practices",
        description: "Discover how to effectively track and analyze your trades for continuous improvement.",
        duration: "14:15",
        views: "7.3K",
        category: "beginner",
        thumbnail: "bg-gradient-to-br from-pink-400 to-pink-600",
        level: "Beginner",
    },
];

export default function UniversityPage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredVideos = videos.filter((video) => {
        const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
        const matchesSearch =
            searchQuery === "" ||
            video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getLevelColor = (level: string) => {
        switch (level) {
            case "Beginner":
                return "bg-green-100 text-green-700";
            case "Intermediate":
                return "bg-amber-100 text-amber-700";
            case "Advanced":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Trading University</h1>
                <p className="text-sm text-gray-500">
                    Learn trading fundamentals and advanced strategies from expert traders
                </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-md">
                <Input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "outline"}
                            onClick={() => setSelectedCategory(category.id)}
                            className="flex items-center gap-2"
                        >
                            <Icon className="h-4 w-4" />
                            {category.name}
                        </Button>
                    );
                })}
            </div>

            {/* Video Grid */}
            {filteredVideos.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-500 mb-2">No videos found</p>
                        <p className="text-sm text-gray-400">
                            {searchQuery ? "Try a different search term" : "Select a different category"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVideos.map((video) => (
                        <Card
                            key={video.id}
                            className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                            {/* Thumbnail */}
                            <div className={`relative aspect-video ${video.thumbnail} flex items-center justify-center`}>
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                                <div className="relative w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Play className="h-5 w-5 text-gray-900 ml-1" />
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {video.duration}
                                </div>
                            </div>

                            {/* Content */}
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <Badge className={getLevelColor(video.level)} variant="secondary">
                                        {video.level}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Eye className="h-3 w-3" />
                                        {video.views}
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {video.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {video.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
