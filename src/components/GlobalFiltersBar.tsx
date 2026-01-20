"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
    setSelectedAccountId,
    setDateRange,
    setAccounts,
    setIsLoadingAccounts
} from "@/redux/slices/globalFiltersSlice";
import { getAllAccounts } from "@/server/actions/accounts";
import { DatePickerWithRange } from "./history/DatePicker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { DateRange } from "react-day-picker";

export default function GlobalFiltersBar() {
    const dispatch = useAppDispatch();
    const { selectedAccountId, accounts, isLoadingAccounts, dateRange } = useAppSelector(
        (state) => state.globalFilters
    );

    useEffect(() => {
        const fetchAccounts = async () => {
            dispatch(setIsLoadingAccounts(true));
            const fetchedAccounts = await getAllAccounts();
            dispatch(setAccounts(fetchedAccounts));
            dispatch(setIsLoadingAccounts(false));
        };

        fetchAccounts();
    }, [dispatch]);

    const handleAccountChange = (value: string) => {
        dispatch(setSelectedAccountId(value));
    };

    const handleDateChange = (range: DateRange | undefined) => {
        dispatch(setDateRange({
            from: range?.from?.toISOString(),
            to: range?.to?.toISOString(),
        }));
    };

    // Convert string dates back to Date objects for the DatePicker
    const datePickerValue: DateRange | undefined = {
        from: dateRange.from ? new Date(dateRange.from) : undefined,
        to: dateRange.to ? new Date(dateRange.to) : undefined,
    };

    return (
        <div className="flex flex-wrap items-center gap-4 bg-white border-b border-zinc-200 px-6 py-3 sticky top-16 z-20">
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Account:</span>
                <Select value={selectedAccountId} onValueChange={handleAccountChange}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                        <SelectValue placeholder="All Accounts" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Accounts</SelectItem>
                        {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                                {account.name} ({account.broker})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="h-6 w-px bg-zinc-200 hidden sm:block" />

            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Period:</span>
                <DatePickerWithRange
                    className="w-[260px]"
                    date={datePickerValue}
                    setDate={handleDateChange as any}
                />
            </div>
        </div>
    );
}
