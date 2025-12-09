"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { newTradeFormSchema } from "@/zodSchema/schema";
import { Strategy } from "@/types/strategies.types";
import { Rule } from "@/types/dbSchema.types";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { StrategyRules } from "./StrategyRules";

interface StrategyTabProps {
    form: UseFormReturn<z.infer<typeof newTradeFormSchema>>;
    strategies: Strategy[];
    selectedStrategyId: string;
    checkedOpenRules: string[];
    checkedCloseRules: string[];
    onStrategyChange: (value: string) => void;
    onOpenRuleToggle: (ruleId: string, rule: Rule) => void;
    onCloseRuleToggle: (ruleId: string, rule: Rule) => void;
}

export const StrategyTab = ({
    form,
    strategies,
    selectedStrategyId,
    checkedOpenRules,
    checkedCloseRules,
    onStrategyChange,
    onOpenRuleToggle,
    onCloseRuleToggle,
}: StrategyTabProps) => {
    const { control, formState: { errors } } = form;
    const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);

    return (
        <div className="relative">
            <div className="max-h-[70vh] 2xl:max-h-[100vh] md:overflow-y-auto pb-24 pr-1">
                {/* Strategy Selection */}
                <div className="mb-4 flex flex-col gap-1">
                    <Label htmlFor="strategyName" className="mb-1">
                        Strategy (optional):
                    </Label>
                    {strategies.length === 0 ? (
                        <div className="rounded-md border border-dashed border-zinc-300 p-3 text-sm text-zinc-600">
                            You don&quot;t have any strategies yet.
                        </div>
                    ) : (
                        <Controller
                            name="strategyName"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        onStrategyChange(value);
                                    }}
                                    value={selectedStrategy?.strategyName || field.value}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a strategy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {strategies.map((strategy) => (
                                                <SelectItem
                                                    key={strategy.id}
                                                    value={strategy.strategyName}>
                                                    {strategy.strategyName}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    )}
                    {errors.strategyName && (
                        <p className="text-red-500 text-sm">
                            {errors.strategyName.message}
                        </p>
                    )}
                </div>

                {/* Strategy Rules */}
                {selectedStrategy && (
                    <StrategyRules
                        strategy={selectedStrategy}
                        checkedOpenRules={checkedOpenRules}
                        checkedCloseRules={checkedCloseRules}
                        onOpenRuleToggle={onOpenRuleToggle}
                        onCloseRuleToggle={onCloseRuleToggle}
                    />
                )}
            </div>
        </div>
    );
};