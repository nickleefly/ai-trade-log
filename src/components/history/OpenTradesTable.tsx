"use client";

import Image from "next/image";
import { MdDelete } from "react-icons/md";
import { BookOpen, Moon, Sun } from "lucide-react";
import { PiCalendarDotsThin } from "react-icons/pi";

import { Trades } from "@/types";
import { isInMorningRange } from "@/features/history/isInMorningRange";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CustomButton } from "../CustomButton";
import { TradeDialog } from "../trade-dialog";
import DeleteTradeDialog from "./DeleteTradeDialog";
import { useState } from "react";
import { useDeleteOpenTrade } from "@/hooks/useDeleteOpenTrade";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

type OpenTradesTableProps = {
    trades: Trades[];
    startCapital: string | null;
};

const INSTRUMENT_LABELS = [
    { name: "Crypto", shortcut: "CRY" },
    { name: "Forex", shortcut: "FX" },
    { name: "Stock", shortcut: "STO" },
    { name: "Index", shortcut: "IDX" },
    { name: "Commodity", shortcut: "CMD" },
    { name: "Bond", shortcut: "BND" },
    { name: "ETF", shortcut: "ETF" },
    { name: "Option", shortcut: "OPT" },
    { name: "Other", shortcut: "OTHER" },
];

const getInstrumentLabel = (instrument: string | undefined) => {
    if (!instrument) return "OTHER";
    return INSTRUMENT_LABELS.find(
        (label) => label.name.toLowerCase() === instrument.toLowerCase()
    )?.shortcut;
};

export const OpenTradesTable = ({ trades, startCapital }: OpenTradesTableProps) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tradeToDelete, setTradeToDelete] = useState<Trades | null>(null);
    const { handleDeleteOpenTrade } = useDeleteOpenTrade();
    if (!trades || trades.length === 0) {
        return (
            <div className="p-4 text-center text-zinc-500">No open trades</div>
        );
    }

    return (
        <div className={`flex flex-col md:h-full mt-2`}>
            {/* Grid Header */}
            <div className="grid grid-cols-4 md:grid-cols-27 gap-1 p-2 items-center border-b bg-muted/50 font-medium text-sm sticky top-0 bg-white">
                <div className="col-span-1 md:col-span-2 text-left">Symbol</div>
                <div className="hidden md:block md:col-span-2 text-center">Instrument</div>
                <div className="hidden md:block md:col-span-2 text-center">Type</div>
                <div className="col-span-1 md:col-span-4 text-center">Open date</div>
                <div className="hidden md:block md:col-span-2 text-center">Open time</div>
                <div className="hidden md:block md:col-span-4 text-center">Open price</div>
                <div className="hidden md:block md:col-span-2 text-center">Quantity</div>
                <div className="hidden md:block md:col-span-3 text-center">
                    Deposit
                    <p className="text-[.75rem]">(% of capital)</p>
                </div>
                <div className="hidden md:block md:col-span-2 text-center">Cost</div>
                <div className="hidden md:block md:col-span-1 text-center">Note</div>
                <div className="col-span-1 text-center">Delete</div>
                <div className="col-span-1 md:col-span-2 text-center">Close</div>
            </div>
            <div className="flex-1 overflow-auto">
                {trades.map((trade) => (
                    <div
                        key={trade.id}
                        className="grid grid-cols-4 md:grid-cols-27 gap-1 p-2 border-b hover:bg-muted/30 transition-colors items-center"
                    >
                        {/* Symbol */}
                        <div className="col-span-1 md:col-span-2 truncate">
                            {trade.symbolName}
                        </div>

                        {/* Instrument */}
                        <div className="hidden md:block md:col-span-2 text-center">
                            <div className="border border-zinc-300 rounded-md px-2 py-1 text-xs inline-block">
                                {getInstrumentLabel(trade.instrumentName)}
                            </div>
                        </div>

                        {/* Type */}
                        <div className="hidden md:block md:col-span-2 text-center">
                            <p
                                className={`bg-${trade.positionType === "sell" ? "sell" : "buy"
                                    } w-fit px-2 py-1 rounded-md text-white text-xs mx-auto`}
                            >
                                {trade.positionType}
                            </p>
                        </div>

                        {/* Open Date */}
                        <div className="col-span-1 md:col-span-4 text-center text-neutral-500">
                            <div className="flex gap-1 items-center justify-center">
                                <PiCalendarDotsThin className="max-md:hidden" />
                                <span className="text-sm">
                                    {new Intl.DateTimeFormat("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    }).format(new Date(trade.openDate))}
                                </span>
                            </div>
                        </div>

                        {/* Open Time */}
                        <div className="hidden md:block md:col-span-2 text-center text-neutral-500">
                            <div className="flex gap-1 items-center justify-center">
                                {isInMorningRange(trade.openTime) ? (
                                    <Sun className="h-3 w-3" />
                                ) : (
                                    <Moon className="h-3 w-3" />
                                )}
                                <span className="text-sm">{trade.openTime}</span>
                            </div>
                        </div>

                        {/* Open Price only */}
                        <div className="hidden md:block md:col-span-4 text-center text-sm">
                            {trade.entryPrice}
                        </div>

                        {/* Quantity */}
                        <div className="hidden md:block md:col-span-2 text-center text-sm">
                            {trade.quantity}
                        </div>

                        {/* Deposit */}
                        <div className="hidden md:block md:col-span-3">
                            <div className="flex flex-col gap-1 text-center">
                                <span className="text-sm font-medium">
                                    {Number(trade.deposit).toLocaleString("de-DE")}
                                </span>
                                <span className="text-sm text-neutral-400">
                                    ({
                                        startCapital && +startCapital !== 0
                                            ? `${Math.round(
                                                (Number(trade.deposit) /
                                                    Number(startCapital)) *
                                                100
                                            )}%`
                                            : "no capital"
                                    })
                                </span>
                            </div>
                        </div>

                        {/* Cost */}
                        <div className="hidden md:block md:col-span-2 text-center text-sm">
                            {trade.totalCost}
                        </div>

                        {/* Note */}
                        <div className="hidden md:block md:col-span-1 text-center">
                            {trade.notes && (
                                <HoverCard>
                                    <HoverCardTrigger className="flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-gray-600 hover:text-gray-800 cursor-pointer" />
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <Image
                                                    src="/logo.svg"
                                                    height={20}
                                                    width={20}
                                                    alt="logo"
                                                />
                                                <h1 className="text-neutral-400">
                                                    @tradejournal.one
                                                </h1>
                                            </div>
                                            <div className="py-2">{trade.notes}</div>
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            )}
                        </div>

                        {/* Delete */}
                        <div className="col-span-1 text-center">
                            <MdDelete
                                onClick={() => {
                                    setTradeToDelete(trade);
                                    setDeleteDialogOpen(true);
                                }}
                                className="text-lg text-sell cursor-pointer hover:text-red-600 transition-colors mx-auto"
                            />
                        </div>

                        {/* Close position */}
                        <div className="col-span-1 md:col-span-2 flex justify-center">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <CustomButton isBlack={false}>
                                        Close
                                    </CustomButton>
                                </SheetTrigger>
                                <SheetContent className="">
                                    <TradeDialog
                                        editMode={true}
                                        existingTrade={trade}
                                        initialTab="close-details"
                                    />
                                </SheetContent>
                            </Sheet>
                        </div>
                        <DeleteTradeDialog
                            isOpen={deleteDialogOpen}
                            onOpenChange={setDeleteDialogOpen}
                            message={`Do you want to delete this open trade${tradeToDelete ? ` "${tradeToDelete.symbolName}"` : ""}?`}
                            onConfirm={async () => {
                                if (!tradeToDelete) return;
                                await handleDeleteOpenTrade(tradeToDelete.id);
                                setDeleteDialogOpen(false);
                                setTradeToDelete(null);
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OpenTradesTable;


