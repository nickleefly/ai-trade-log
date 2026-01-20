"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MentorMode } from "@/components/mentor/MentorMode";
import { MenteeMode } from "@/components/mentor/MenteeMode";
import { InviteDialog } from "@/components/mentor/InviteDialog";
import { UserPlus, GraduationCap } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function MentorPage() {
    const { user } = useUser();
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

    if (!user?.id) {
        return (
            <div className="flex items-center justify-center p-6">
                <p className="text-gray-500">Please log in to access Mentor Mode</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mentor Mode</h1>
                    <p className="text-sm text-gray-500">
                        Connect with mentors or mentor other traders
                    </p>
                </div>
                <button
                    onClick={() => setInviteDialogOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <UserPlus className="h-4 w-4" />
                    Invite
                </button>
            </div>

            <Tabs defaultValue="mentor">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mentor" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        I'm a Mentor
                    </TabsTrigger>
                    <TabsTrigger value="mentee" className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        I'm a Student
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="mentor">
                    <MentorMode userId={user.id} />
                </TabsContent>

                <TabsContent value="mentee">
                    <MenteeMode userId={user.id} />
                </TabsContent>
            </Tabs>

            {inviteDialogOpen && (
                <InviteDialog
                    open={inviteDialogOpen}
                    onClose={() => setInviteDialogOpen(false)}
                />
            )}
        </div>
    );
}
