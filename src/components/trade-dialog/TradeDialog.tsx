"use client";

import dayjs from "dayjs";

import { Trades } from "@/types";
import { DialogClose, DialogTitle, DialogHeader, DialogDescription } from "../ui/dialog";
import { CustomButton } from "../CustomButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { useTradeForm } from "./hooks/useTradeForm";
import { OpenDetailsTab } from "./OpenDetailsTab";
import { CloseDetailsTab } from "./CloseDetailsTab";
import { StrategyTab } from "./StrategyTab";

interface TradeDialogProps {
    editMode?: boolean;
    existingTrade?: Trades;
    day?: dayjs.Dayjs | undefined;
    onRequestClose?: () => void;
    initialTab?: "open-details" | "close-details" | "strategy";
}

export const TradeDialog = ({
    editMode = false,
    existingTrade,
    day,
    onRequestClose,
    initialTab = "open-details",
}: TradeDialogProps) => {
    const tradeForm = useTradeForm({
        editMode,
        existingTrade,
        day,
        onRequestClose,
    });

    return (
        <form
            onSubmit={tradeForm.form.handleSubmit(tradeForm.onSubmit, (errors) => {
                console.log("Form validation errors:", errors);
            })}
            className="sm:max-w-[460px] flex flex-col ">

            <DialogHeader className="mb-6">
                <DialogTitle className="text-center text-[1.4rem]">
                    {editMode ? "Edit Trade" : "Add a New Trade"}
                </DialogTitle>
                <DialogDescription className="text-center text-[.9rem] text-tertiary">
                    `If you fill in only the “Open Details” section and save, your trade will be marked as OPEN. It will appear on the calendar (in a blue oval) and on the history page, where you’ll have the option to close it later.`
                </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue={initialTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="open-details">Open Details</TabsTrigger>
                    <TabsTrigger value="close-details">Close Details</TabsTrigger>
                    <TabsTrigger value="strategy">Strategy</TabsTrigger>
                </TabsList>

                <TabsContent value="open-details" className="flex flex-col gap-2">
                    <OpenDetailsTab
                        form={tradeForm.form}
                        openDate={tradeForm.openDate}
                        setOpenDate={tradeForm.setOpenDate}
                        symbolLabels={tradeForm.symbolLabels}
                        day={day}
                    />

                    <div className="flex gap-6 justify-end md:absolute md:bottom-8 md:right-8 mt-4">
                        <DialogClose asChild>
                            <CustomButton isBlack={false}>Cancel</CustomButton>
                        </DialogClose>
                        <CustomButton
                            isBlack
                            type="submit"
                            disabled={tradeForm.submittingTrade}>
                            {editMode ? "Update Trade" : "Add Trade"}
                        </CustomButton>
                    </div>
                </TabsContent>

                <TabsContent value="close-details" className="flex flex-col gap-2">
                    <CloseDetailsTab
                        form={tradeForm.form}
                        openDate={tradeForm.openDate}
                        closeDate={tradeForm.closeDate}
                        setCloseDate={tradeForm.setCloseDate}
                    />

                    <div className="flex gap-6 justify-end md:absolute md:bottom-8 md:right-8 mt-4">
                        <DialogClose asChild>
                            <CustomButton isBlack={false}>Cancel</CustomButton>
                        </DialogClose>
                        <CustomButton
                            isBlack
                            type="submit"
                            disabled={tradeForm.submittingTrade}>
                            {editMode ? "Update Trade" : "Add Trade"}
                        </CustomButton>
                    </div>
                </TabsContent>

                <TabsContent value="strategy">
                    <StrategyTab
                        form={tradeForm.form}
                        strategies={tradeForm.localStrategies}
                        selectedStrategyId={tradeForm.selectedStrategyId}
                        checkedOpenRules={tradeForm.checkedOpenRules}
                        checkedCloseRules={tradeForm.checkedCloseRules}
                        onStrategyChange={tradeForm.handleStrategyChange}
                        onOpenRuleToggle={tradeForm.handleOpenRuleToggle}
                        onCloseRuleToggle={tradeForm.handleCloseRuleToggle}
                    />

                    <div className="flex gap-6 justify-end md:absolute md:bottom-8 md:right-8 mt-4">
                        <DialogClose asChild>
                            <CustomButton isBlack={false}>Cancel</CustomButton>
                        </DialogClose>
                        <CustomButton
                            isBlack
                            type="submit"
                            disabled={tradeForm.submittingTrade}>
                            {editMode ? "Update Trade" : "Add Trade"}
                        </CustomButton>
                    </div>
                </TabsContent>
            </Tabs>
        </form>
    );
};