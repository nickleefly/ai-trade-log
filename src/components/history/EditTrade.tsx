"use client";

import { useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";
import { TradeDialog } from "../trade-dialog";
import { Trades } from "@/types";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

interface EditTradeProps {
    trade: Trades;
}

export default function EditTrade({ trade }: EditTradeProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Close dialog when TradeDialog requests it
    useEffect(() => {
        const onClose = () => setIsOpen(false);
        document.addEventListener("trade-dialog:request-close", onClose);
        return () => document.removeEventListener("trade-dialog:request-close", onClose);
    }, []);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button className="p-2 md:hover:text-zinc-900 md:hover:bg-zinc-200 rounded-md transition-colors">
                    <MdEdit className="w-4 h-4 text-gray-600 hover:text-gray-800" />
                </button>
            </SheetTrigger>
            <SheetContent className="">
                <TradeDialog
                    editMode={true}
                    existingTrade={trade}
                    day={undefined}
                    onRequestClose={() => setIsOpen(false)}
                />
            </SheetContent>
        </Sheet>
    );
}