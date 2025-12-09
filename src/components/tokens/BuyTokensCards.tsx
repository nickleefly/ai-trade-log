"use client";

import { Check } from "lucide-react";
import React, { useEffect } from "react";

import { toast } from "sonner";
import { checkoutCredits } from "@/server/actions/stripe";
import { useUser } from "@clerk/nextjs";

export default function BuyTokensCards() {
    const { user } = useUser();


    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get("success")) {
            toast.success("Order placed!");
        }

        if (query.get("canceled")) {
            toast.error("Order canceled!");
        }
    }, []);

    const handleGoToCheckout = async (plan: string) => {
        // Payments are currently disabled
        toast.error("Payments are currently disabled. Please contact support for assistance.");
        return;

        // Original implementation (commented out)
        /*
        if (!user) {
            return;
        }
        const transaction = {
            plan,
            buyerId: user?.id,
        };

        await checkoutCredits(transaction);
        */
    };
    return (
        <div className="md:min-h-[30rem] px-2 md:px-0 w-full flex flex-col gap-4 lg:flex-row lg:gap-4">
            {/* Payment Disabled Notice */}
            <div className="w-full mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                            Payments Temporarily Disabled
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                            <p>Token purchases are currently unavailable. Please contact support for assistance.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border border-zinc-300 h-auto w-full lg:w-1/3 flex flex-col gap-5 rounded-xl px-6 pt-6 pb-10 md:pb-6">
                <div className="flex flex-col gap-1">
                    <p className="flex items-center text-2xl">Stripe</p>
                    <div className="flex gap-1 items-baseline relative ml-4 mt-2">
                        <div className="absolute -left-4 top-0 text-xl text-zinc-500">
                            $
                        </div>
                        <div className="text-5xl">5</div>
                        <div className="relative text-zinc-500">
                            / 20 Tokens
                        </div>
                    </div>
                    <p className="text-[.9rem] mt-2 mr-2">
                        Perfect for testing, our AI-powered reports can help you
                        boost your productivity and fix mistakes.
                    </p>
                </div>
                <div className="flex flex-col">
                    <button
                        onClick={() => handleGoToCheckout("5")}
                        className="bg-gray-400 text-gray-600 py-[.75rem] px-[1rem] rounded-full cursor-not-allowed"
                        disabled>
                        Payments Disabled
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">Support the project</p>
                    </div>
                    <p className="ml-5">
                        (Your support will help us to make this project better
                        and add new features in the future)
                    </p>
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">20 tokens</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">
                            Free access to Calendar, History and Statistics
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">
                            Access to latest Claude AI model - Sonet 3.7
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">
                            History page for your AI reports.
                        </p>
                    </div>
                </div>
            </div>
            <div className="border border-claude bg-claudeBackground h-auto w-full lg:w-1/3 rounded-xl flex flex-col gap-6 px-6 pt-6 pb-10 md:pb-6">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <p className="flex items-center text-2xl">Crypto</p>
                        <span className="ml-1 rounded-md border border-claude px-2 py-1 text-claude">
                            Coming soon
                        </span>
                    </div>
                    <div className="flex gap-1 items-baseline relative ml-4 mt-2">
                        <div className="absolute -left-4 top-0 text-xl text-zinc-500">
                            $
                        </div>
                        <div className="text-5xl">Custom</div>
                        <div className="relative text-zinc-500">
                            / 100 Tokens
                        </div>
                    </div>
                    <p className="text-[.9rem] mt-2 mr-2">
                        Perfect for busy traders, our AI reports help you stay
                        ahead in a fast-changing trading environment.
                    </p>
                </div>
                <div className="flex flex-col">
                    <button
                        className="bg-claude opacity-50 text-white py-[.75rem] px-[1rem] rounded-full"
                        disabled>
                        Buy Tokens
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">Support the project</p>
                    </div>
                    <p className="ml-5">
                        (Your support will help us to make this project better
                        and add new features in the future)
                    </p>
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">100 tokens</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">
                            Secure transactions using smart contracts.
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">
                            Supports Etherium, BNB, USDC, USDT and DAI.
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">
                            Free access to Calendar, History and Statistics
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">
                            Access to latest Claude AI model - Sonet 3.7
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">
                            History page for your AI reports.
                        </p>
                    </div>
                </div>
            </div>
            <div className="border border-zinc-300 h-auto w-full lg:w-1/3 flex flex-col gap-6 rounded-xl px-6 pt-6 pb-10 md:pb-6">
                <div className="flex flex-col gap-1">
                    <p className="flex items-center text-2xl">Stripe</p>
                    <div className="flex gap-1 items-baseline relative ml-4 mt-2">
                        <div className="absolute -left-4 top-0 text-xl text-zinc-500">
                            $
                        </div>
                        <div className="text-5xl">10</div>
                        <div className="relative text-zinc-500">
                            / 60 Tokens
                        </div>
                    </div>
                    <p className="text-[.9rem] mt-2 mr-2">
                        Perfect for busy traders, our AI reports help you stay
                        ahead in a fast-changing trading environment.
                    </p>
                </div>
                <div className="flex flex-col">
                    <button
                        onClick={() => handleGoToCheckout("10")}
                        className="bg-gray-400 text-gray-600 py-[.75rem] px-[1rem] rounded-full cursor-not-allowed"
                        disabled>
                        Payments Disabled
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">Support the project</p>
                    </div>
                    <p className="ml-5">
                        (Your support will help us to make this project better
                        and add new features in the future)
                    </p>
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">60 tokens</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">
                            Free access to Calendar, History and Statistics
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">
                            Access to latest Claude AI model - Sonet 3.7
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Check size={12} />
                        <p className="text-[.9rem]">
                            History page for your AI reports.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
