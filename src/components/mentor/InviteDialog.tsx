"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface InviteDialogProps {
    open: boolean;
    onClose: () => void;
}

export function InviteDialog({ open, onClose }: InviteDialogProps) {
    const { user } = useUser();
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"mentee" | "mentor">("mentee");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !email) return;

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/mentor/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    role,
                    inviterId: user.id,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Success - close dialog
                setEmail("");
                onClose();
            } else {
                setError(data.error || "Failed to send invite");
            }
        } catch (error) {
            console.error("Failed to send invite:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEmail("");
        setError("");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send Invitation</DialogTitle>
                    <DialogDescription>
                        Invite someone to be your mentor or student
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="role">I want to invite a</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={role === "mentee" ? "default" : "outline"}
                                    className="flex-1"
                                    onClick={() => setRole("mentee")}
                                >
                                    Student
                                </Button>
                                <Button
                                    type="button"
                                    variant={role === "mentor" ? "default" : "outline"}
                                    className="flex-1"
                                    onClick={() => setRole("mentor")}
                                >
                                    Mentor
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="trader@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Send Invite
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
