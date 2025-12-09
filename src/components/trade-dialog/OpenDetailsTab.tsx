"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { months } from "@/data/data";
import { newTradeFormSchema } from "@/zodSchema/schema";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { useAutoCalcOpenFields } from "./hooks/useAutoCalcOpenFields";

const instrumentLabels = ["Crypto", "Forex", "Stock", "Index", "Commodity", "Bond", "ETF", "Option", "Other"];

interface OpenDetailsTabProps {
    form: UseFormReturn<z.infer<typeof newTradeFormSchema>>;
    openDate: Date | undefined;
    setOpenDate: (date: Date | undefined) => void;
    symbolLabels: string[];
    day?: dayjs.Dayjs | undefined;
}

export const OpenDetailsTab = ({
    form,
    openDate,
    setOpenDate,
    symbolLabels,
    day
}: OpenDetailsTabProps) => {
    const { register, control, setValue, formState: { errors } } = form;

    // Auto-calculate the third field among entryPrice, quantity, totalCost
    useAutoCalcOpenFields(form);

    return (
        <div className="flex flex-col gap-4">
            {/* Date and Time Section */}
            <div className="mb-2 flex gap-4">
                <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="close-time" className="mb-1">
                            Open date:
                        </Label>
                        {errors.openDate && (
                            <span className="mb-1 text-[.75rem] text-red-500">
                                {errors.openDate.message}
                            </span>
                        )}
                    </div>

                    {day == undefined ? (
                        <Controller
                            name="openDate"
                            control={control}
                            render={({ field }) => (
                                <Popover modal={true}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className="justify-start text-left font-normal max-md:text-[.75rem]">
                                            <CalendarIcon />
                                            {openDate ? (
                                                format(openDate, "dd MMM yyyy")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Calendar
                                            mode="single"
                                            selected={openDate}
                                            onSelect={(date) => {
                                                setOpenDate(date);
                                                field.onChange(date?.toISOString());
                                            }}
                                            defaultMonth={new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                    ) : (
                        <Input
                            disabled
                            className="max-md:text-[.75rem]"
                            placeholder={`${day.date()} ${months[day.month()].slice(0, 3)} ${day.year()}`}
                        />
                    )}
                </div>
                <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="open-time" className="mb-1">
                            Open time:
                        </Label>
                        <span className="text-[.75rem] text-black/50">
                            (default time)
                        </span>
                    </div>
                    <Input
                        type="time"
                        id="open-time"
                        className="w-full max-md:text-[.75rem]"
                        {...register("openTime")}
                    />
                </div>
            </div>

            {/* Symbol Name Section */}
            <div className="mb-2 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <Label htmlFor="symbolName" className="mb-1">
                        Symbol:
                    </Label>

                    {errors.symbolName ? (
                        <span className="mb-1 text-[.75rem] text-red-500">
                            {errors.symbolName.message}
                        </span>
                    ) : (
                        <span className="mb-1 text-[.75rem] text-black/50">
                            (e.g. Bitcoin or BTC)
                        </span>
                    )}
                </div>
                <Controller
                    name="symbolName"
                    control={control}
                    render={({ field }) => (
                        <div className="flex gap-2">
                            <Input
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Type manually"
                                type="text"
                                className="w-2/3 max-md:text-[.75rem]"
                            />
                            <Select onValueChange={field.onChange}>
                                <SelectTrigger className="w-1/3">
                                    <div className="text-zinc-500">
                                        Or select
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {symbolLabels.map((label) => (
                                            <SelectItem key={label} value={label}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                />
            </div>

            {/* Instrument Name Section */}
            <div className="flex gap-2">

                <div className="mb-2 flex flex-col gap-1 flex-1">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="instrumentName" className="mb-1">
                            Instrument:
                        </Label>

                        {errors.instrumentName ? (
                            <span className="mb-1 text-[.75rem] text-red-500">
                                {errors.instrumentName.message}
                            </span>
                        ) : (
                            <span className="mb-1 text-[.75rem] text-black/50">
                                (e.g. Crypto or Forex)
                            </span>
                        )}
                    </div>
                    <Controller
                        name="instrumentName"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select instrument" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {instrumentLabels.map((label) => (
                                                <SelectItem key={label} value={label}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />
                </div>
                <div className="mb-2 flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                        <Label className="mb-1">Position type:</Label>
                        {errors.positionType ? (
                            <span className="mb-1 text-[.75rem] text-red-500">
                                {errors.positionType.message}
                            </span>
                        ) : (
                            <span className="mb-1 text-[.75rem] text-black/50">
                                (Click to change)
                            </span>
                        )}
                    </div>
                    <Controller
                        name="positionType"
                        control={control}
                        render={({ field }) => (
                            <div
                                className={`h-[40px] ${field.value === "buy" ? "bg-buy" : "bg-sell"
                                    } rounded-md cursor-pointer flex-center`}
                                onClick={() =>
                                    field.value === "buy"
                                        ? setValue("positionType", "sell")
                                        : setValue("positionType", "buy")
                                }>
                                <p className="text-white">
                                    {field.value === "buy" ? "Buy" : "Sell"}
                                </p>
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* Position Type Section */}
            <div className="flex gap-2">


                <div className="mb-2 flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="entryPrice" className="mb-1">
                            Deposit:
                        </Label>
                        {errors.deposit ? (
                            <span className="mb-1 text-[.75rem] text-red-500">
                                {errors.deposit.message}
                            </span>
                        ) : (
                            <span className="mb-1 text-[.75rem] text-black/50">
                                (Only num.)
                            </span>
                        )}
                    </div>
                    <Input
                        type="number"
                        id="deposit"
                        className="w-full max-md:text-[.75rem]"
                        {...register("deposit")}
                    />
                </div>
                <div className="mb-2 flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="entryPrice" className="mb-1">
                            Entry price:
                        </Label>
                        {errors.entryPrice ? (
                            <span className="mb-1 text-[.75rem] text-red-500">
                                {errors.entryPrice.message}
                            </span>
                        ) : (
                            <span className="mb-1 text-[.75rem] text-black/50">
                                (Only num.)
                            </span>
                        )}
                    </div>
                    <Input
                        type="number"
                        id="entryPrice"
                        step="any"
                        className="w-full max-md:text-[.75rem]"
                        {...register("entryPrice")}
                    />
                </div>
            </div>

            {/* Quantity and Total cost Section */}
            <div className="flex gap-2">
                <div className="mb-2 flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="quantity" className="mb-1">
                            Quantity:
                        </Label>
                        {errors.quantity ? (
                            <span className="mb-1 text-[.75rem] text-red-500">
                                {errors.quantity.message}
                            </span>
                        ) : (
                            <span className="mb-1 text-[.75rem] text-black/50">
                                (Only num.)
                            </span>
                        )}
                    </div>
                    <Input
                        type="number"
                        id="quantity"
                        step="any"
                        className="w-full max-md:text-[.75rem]"
                        {...register("quantity")}
                    />
                </div>
                <div className="mb-2 flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="totalCost" className="mb-1">
                            Total cost:
                        </Label>
                        {errors.totalCost ? (
                            <span className="mb-1 text-[.75rem] text-red-500">
                                {errors.totalCost.message}
                            </span>
                        ) : (
                            <span className="mb-1 text-[.75rem] text-black/50">
                                (Only num.)
                            </span>
                        )}
                    </div>
                    <Input
                        type="number"
                        id="totalCost"
                        className="w-full max-md:text-[.75rem]"
                        {...register("totalCost")}
                    />
                </div>
            </div>

            {/* Notes Section */}
            <div className="mb-4 flex flex-col gap-1">
                <Label htmlFor="notes" className="mb-1">
                    Notes (optional):
                </Label>
                <textarea
                    id="notes"
                    rows={2}
                    className="w-full outline-none rounded-md border border-zinc-200 px-3 py-1 resize-none text-[0.9rem]"
                    {...register("notes")}
                />
            </div>
        </div>
    );
};