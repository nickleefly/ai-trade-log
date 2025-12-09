import BuyTokensCards from "@/components/tokens/BuyTokensCards";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getPlural } from "@/lib/utils";
import { checkIfUserHasTokens } from "@/server/actions/user";
import { RiCoinsLine } from "react-icons/ri";
import React from "react";

export default async function Page() {
    const tokens = await checkIfUserHasTokens();

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 md:px-8 py-4">
                <h1 className="text-[2rem]">Buy Tokens</h1>
                <div className="flex gap-6">
                    {!tokens.success ? (
                        <HoverCard>
                            <HoverCardTrigger className="cursor-pointer duration-100 text-[.9rem] flex gap-1 items-center">
                                <div className="rounded-lg border border-gray-200 p-2 flex items-center gap-2 cursor-pointer">
                                    No tokens
                                </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="">
                                <p className="text-[.9rem] text-sell">
                                    {tokens.message}
                                </p>
                            </HoverCardContent>
                        </HoverCard>
                    ) : tokens.tokens ? (
                        <div className="p-2 flex items-center gap-2">
                            <RiCoinsLine size={20} className="text-[#da7756]" />
                            {tokens.tokens}{" "}
                            {getPlural(tokens.tokens, "Token", "Tokens")}
                        </div>
                    ) : (
                        <div className="p-2 flex items-center gap-2">
                            <RiCoinsLine size={20} className="text-[#da7756]" />0
                            Tokens
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <BuyTokensCards />
            </div>
        </div>
    );
}
