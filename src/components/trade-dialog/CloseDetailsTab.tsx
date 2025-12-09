"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { newTradeFormSchema } from "@/zodSchema/schema";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { StarRating } from "../calendar/StarRating";

interface CloseDetailsTabProps {
    form: UseFormReturn<z.infer<typeof newTradeFormSchema>>;
    openDate: Date | undefined;
    closeDate: Date | undefined;
    setCloseDate: (date: Date | undefined) => void;
}

export const CloseDetailsTab = ({
    form,
    openDate,
    closeDate,
    setCloseDate,
}: CloseDetailsTabProps) => {
    const { register, control, formState: { errors }, setValue } = form;
    // Live values while typing
    const depositValue = form.watch("deposit");
    const resultValue = form.watch("result");
    const quantityValue = form.watch("quantity");
    const depositNum = Number(depositValue);
    const resultNum = Number(resultValue);
    const hasValidNumbers = Number.isFinite(depositNum) && Number.isFinite(resultNum) && depositValue?.toString().trim() !== "" && resultValue?.toString().trim() !== "" && depositNum !== 0;
    const percentStr = hasValidNumbers ? ((resultNum / depositNum) * 100).toFixed(2) : "0.0";

    // Prefill and keep quantitySold in sync with quantity
    useEffect(() => {
        const nextVal = quantityValue ?? "";
        setValue("quantitySold", nextVal, { shouldDirty: false, shouldValidate: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quantityValue]);

    return (
        <div className="flex flex-col gap-4">
            {/* Close Date and Time Section */}
            <div className="mb-2 flex gap-4">
                <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="close-date" className="mb-1">
                            Close date:
                        </Label>
                        {errors.closeDate && (
                            <span className="mb-1 text-[.75rem] text-red-500">
                                {errors.closeDate.message}
                            </span>
                        )}
                    </div>
                    <Controller
                        name="closeDate"
                        control={control}
                        render={({ field }) => (
                            <Popover modal={true}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className="justify-start text-left font-normal max-md:text-[.75rem]">
                                        <CalendarIcon />
                                        {closeDate ? (
                                            format(closeDate, "dd MMM yyyy")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <Calendar
                                        mode="single"
                                        selected={closeDate}
                                        onSelect={(date) => {
                                            setCloseDate(date);
                                            field.onChange(date?.toISOString());
                                            // If user picks a date but no closeTime set, default to 12:30
                                            const currentCloseTime = form.getValues("closeTime");
                                            if (!currentCloseTime || currentCloseTime.trim() === "") {
                                                form.setValue("closeTime", "12:30");
                                            }
                                            // If user sets close date without result, set a field error
                                            const currentResult = form.getValues("result");
                                            if (!currentResult || currentResult.trim() === "") {
                                                form.setError("result", {
                                                    type: "manual",
                                                    message: "Please provide a result when setting a close date.",
                                                });
                                            }
                                        }}
                                        disabled={
                                            openDate &&
                                            ((date) =>
                                                date < new Date(openDate.toISOString()))
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                </div>
                <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="close-time" className="mb-1">
                            Close time:
                        </Label>
                        <span className="text-[.75rem] text-black/50">
                            (default time)
                        </span>
                    </div>

                    <Input
                        type="time"
                        id="close-time"
                        className="w-full max-md:text-[.75rem]"
                        {...register("closeTime")}
                    />
                </div>
            </div>

            {/* Close Price and Quantity Sold Section */}
            <div className="flex gap-2">
                <div className="mb-2 flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="sellPrice" className="mb-1">
                            Close price:
                        </Label>
                        {errors.sellPrice ? (
                            <span className="mb-1 text-[.75rem] text-red-500">
                                {errors.sellPrice.message}
                            </span>
                        ) : (
                            <span className="mb-1 text-[.75rem] text-black/50">
                                (Only num.)
                            </span>
                        )}
                    </div>
                    <Input
                        type="number"
                        id="sellPrice"
                        step="any"
                        className="w-full max-md:text-[.75rem]"
                        {...register("sellPrice")}
                    />
                </div>
                <div className="mb-2 flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="quantitySold" className="mb-1">
                            Quantity sold:
                        </Label>
                        {errors.quantitySold ? (
                            <span className="mb-1 text-[.75rem] text-red-500">
                                {errors.quantitySold.message}
                            </span>
                        ) : (
                            <span className="mb-1 text-[.75rem] text-black/50">
                                (coming soon)
                            </span>
                        )}
                    </div>
                    <Input
                        type="number"
                        id="quantitySold"
                        className="w-full max-md:text-[.75rem]"
                        disabled
                        readOnly
                        value={quantityValue ?? ""}
                        {...register("quantitySold")}
                    />
                </div>
            </div>

            {/* Profit or Loss Section */}
            <div className="mb-2 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <Label htmlFor="result" className="mb-1">
                        Profit or Loss:
                    </Label>
                    {errors.result ? (
                        <span className="mb-1 text-[.75rem] text-red-500">
                            {errors.result.message}
                        </span>
                    ) : (
                        <span className="mb-1 text-[.75rem] text-black/50">
                            (Positive for profit, negative for loss)
                        </span>
                    )}
                </div>
                <Input
                    type="number"
                    id="result"
                    step="any"
                    className="w-full max-md:text-[.75rem]"
                    {...register("result")}
                    placeholder="Enter profit (+) or loss (-)"
                />
            </div>

            {/* Profit or Loss Percentage Section */}
            <div className="mb-2 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <Label htmlFor="result" className="mb-1">
                        Profit or Loss Percentage:
                    </Label>

                </div>
                <div>
                    <span className="text-lg text-neutral-400">
                        {percentStr}%
                    </span>
                </div>
            </div>

            {/* Rating Section moved here */}
            <div className="mb-2 flex flex-col gap-2">
                <Label htmlFor="rating" className="mb-1">
                    Rate your trade: {" "}
                    <span className="ml-2 text-[.75rem] text-black/50">
                        (default 0)
                    </span>
                </Label>
                <StarRating setValue={setValue} rating={form.watch("rating")} />
            </div>
        </div>
    );
};
