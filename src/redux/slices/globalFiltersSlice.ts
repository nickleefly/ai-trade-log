import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Account } from "@/types/dbSchema.types";

interface GlobalFiltersState {
    selectedAccountId: string | "all";
    dateRange: {
        from: string | undefined;
        to: string | undefined;
    };
    accounts: Account[];
    isLoadingAccounts: boolean;
}

const initialState: GlobalFiltersState = {
    selectedAccountId: "all",
    dateRange: {
        from: undefined,
        to: undefined,
    },
    accounts: [],
    isLoadingAccounts: false,
};

const globalFiltersSlice = createSlice({
    name: "globalFilters",
    initialState,
    reducers: {
        setSelectedAccountId: (state, action: PayloadAction<string | "all">) => {
            state.selectedAccountId = action.payload;
        },
        setDateRange: (state, action: PayloadAction<{ from: string | undefined; to: string | undefined }>) => {
            state.dateRange = action.payload;
        },
        setAccounts: (state, action: PayloadAction<Account[]>) => {
            state.accounts = action.payload;
        },
        setIsLoadingAccounts: (state, action: PayloadAction<boolean>) => {
            state.isLoadingAccounts = action.payload;
        },
    },
});

export const {
    setSelectedAccountId,
    setDateRange,
    setAccounts,
    setIsLoadingAccounts,
} = globalFiltersSlice.actions;

export default globalFiltersSlice.reducer;
