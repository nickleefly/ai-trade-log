"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Loader2 } from "lucide-react";

interface MenteeModeProps {
    userId: string;
}

interface MentorConnection {
    id: string;
    mentorId: string;
    mentorName: string;
    mentorEmail: string;
    status: string;
    createdAt: string;
}

export function MenteeMode({ userId }: MenteeModeProps) {
    const [mentors, setMentors] = useState<MentorConnection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMentors();
    }, [userId]);

    const fetchMentors = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/mentor/mentors?menteeId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setMentors(data);
            }
        } catch (error) {
            console.error("Failed to fetch mentors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (connectionId: string) => {
        try {
            const response = await fetch("/api/mentor/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ connectionId, status: "cancelled" }),
            });

            if (response.ok) {
                // Refresh the list
                fetchMentors();
            }
        } catch (error) {
            console.error("Failed to cancel request:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "accepted":
                return "default";
            case "pending":
                return "secondary";
            case "declined":
                return "destructive";
            case "cancelled":
                return "outline";
            default:
                return "secondary";
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Your Mentors
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : mentors.length > 0 ? (
                        <div className="space-y-3">
                            {mentors.map((connection) => (
                                <div
                                    key={connection.id}
                                    className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback className="bg-purple-100 text-purple-600">
                                                {connection.mentorName?.[0] || "M"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-gray-900">{connection.mentorName}</p>
                                            <p className="text-sm text-gray-500">{connection.mentorEmail}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getStatusColor(connection.status) as any}>
                                            {connection.status === "accepted"
                                                ? "Active"
                                                : connection.status === "pending"
                                                ? "Pending"
                                                : connection.status}
                                        </Badge>
                                        {connection.status === "pending" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleCancelRequest(connection.id)}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">No mentors yet</p>
                            <p className="text-sm text-gray-400 mb-6">
                                Connect with a mentor to improve your trading
                            </p>
                            <button
                                onClick={() => document.querySelector("button[onClick*='inviteDialogOpen']")?.dispatchEvent(new Event("click"))}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Find a Mentor
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mentee Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <p>Get personalized feedback on your trades</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <p>Learn from experienced traders</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <p>Accelerate your learning curve</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <p>Stay accountable with your goals</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
