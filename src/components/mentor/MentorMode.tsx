"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Loader2 } from "lucide-react";

interface MentorModeProps {
    userId: string;
}

interface MenteeConnection {
    id: string;
    menteeId: string;
    menteeName: string;
    menteeEmail: string;
    status: string;
    createdAt: string;
}

export function MentorMode({ userId }: MentorModeProps) {
    const [mentees, setMentees] = useState<MenteeConnection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMentees();
    }, [userId]);

    const fetchMentees = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/mentor/mentees?mentorId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setMentees(data);
            }
        } catch (error) {
            console.error("Failed to fetch mentees:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (connectionId: string, newStatus: string) => {
        try {
            const response = await fetch("/api/mentor/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ connectionId, status: newStatus }),
            });

            if (response.ok) {
                // Refresh the list
                fetchMentees();
            }
        } catch (error) {
            console.error("Failed to update status:", error);
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
                        <Users className="h-5 w-5 text-primary" />
                        Your Students
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : mentees.length > 0 ? (
                        <div className="space-y-3">
                            {mentees.map((connection) => (
                                <div
                                    key={connection.id}
                                    className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback className="bg-blue-100 text-blue-600">
                                                {connection.menteeName?.[0] || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-gray-900">{connection.menteeName}</p>
                                            <p className="text-sm text-gray-500">{connection.menteeEmail}</p>
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
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleStatusChange(connection.id, "accepted")
                                                    }
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleStatusChange(connection.id, "declined")
                                                    }
                                                >
                                                    Decline
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">No students yet</p>
                            <p className="text-sm text-gray-400 mb-6">
                                Invite students to track their trading progress
                            </p>
                            <button
                                onClick={() => document.querySelector("button[onClick*='inviteDialogOpen']")?.dispatchEvent(new Event("click"))}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Invite Your First Student
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mentor Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <p>Track your students' trading progress</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <p>View their completed trades and strategies</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <p>Monitor their progress tracker habits</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <p>Provide guidance through feedback</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
