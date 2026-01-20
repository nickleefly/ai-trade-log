"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface EditRulesDialogProps {
    open: boolean;
    onClose: () => void;
    userId: string;
}

interface ProgressRule {
    id: string;
    name: string;
    type: "MANUAL" | "AUTOMATED";
    targetDays: string[];
}

export function EditRulesDialog({ open, onClose, userId }: EditRulesDialogProps) {
    const [manualRules, setManualRules] = useState<ProgressRule[]>([]);
    const [newManualRule, setNewManualRule] = useState("");
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (open) {
            fetchRules();
        }
    }, [open, userId]);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/progress/rules?userId=${userId}`);
            if (response.ok) {
                const rules = await response.json();
                setManualRules(rules.filter((r: ProgressRule) => r.type === "MANUAL"));
            }
        } catch (error) {
            console.error("Failed to fetch rules:", error);
        } finally {
            setLoading(false);
        }
    };

    const addRule = async () => {
        if (!newManualRule.trim()) return;

        setAdding(true);
        try {
            const response = await fetch("/api/progress/rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    name: newManualRule,
                    type: "MANUAL",
                    targetDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                }),
            });

            if (response.ok) {
                const newRule = await response.json();
                setManualRules((prev) => [...prev, newRule]);
                setNewManualRule("");
            }
        } catch (error) {
            console.error("Failed to add rule:", error);
        } finally {
            setAdding(false);
        }
    };

    const deleteRule = async (ruleId: string) => {
        try {
            const response = await fetch(`/api/progress/rules/${ruleId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setManualRules((prev) => prev.filter((r) => r.id !== ruleId));
            }
        } catch (error) {
            console.error("Failed to delete rule:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Progress Rules</DialogTitle>
                    <DialogDescription>
                        Customize your daily checklist and automated rules
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="manual">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Manual Rules</TabsTrigger>
                        <TabsTrigger value="automated">Automated Rules</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {manualRules.map((rule) => (
                                        <div
                                            key={rule.id}
                                            className="flex items-center gap-3 p-3 border rounded-lg bg-white"
                                        >
                                            <span className="flex-1 font-medium text-gray-900">
                                                {rule.name}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteRule(rule.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add new rule..."
                                        value={newManualRule}
                                        onChange={(e) => setNewManualRule(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter" && newManualRule.trim()) {
                                                e.preventDefault();
                                                addRule();
                                            }
                                        }}
                                        disabled={adding}
                                    />
                                    <Button onClick={addRule} disabled={adding || !newManualRule.trim()}>
                                        {adding ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Plus className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">
                                        Active Trading Days
                                    </Label>
                                    <div className="flex gap-3 flex-wrap">
                                        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                                            <div key={day} className="flex items-center space-x-2">
                                                <Checkbox id={day} defaultChecked disabled />
                                                <Label htmlFor={day} className="text-sm text-gray-900">
                                                    {day}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        (Day selection coming soon - currently all rules apply to Mon-Fri)
                                    </p>
                                </div>
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="automated">
                        <div className="text-center py-8 text-gray-500">
                            <p>Automated rules coming soon...</p>
                            <p className="text-sm mt-2">
                                Examples: Trading hours, Stop loss on all trades, Daily loss limits,
                                Link trades to strategies
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
