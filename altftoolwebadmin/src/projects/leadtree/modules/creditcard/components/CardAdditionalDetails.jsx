"use client";

import React, { memo, useState } from "react";
import { Field } from "../styles/FieldStyle";
import { Input } from "../styles/InputStyle";


const CardAdditionalDetails = memo(
    ({
        welcomeOffer,
        firstYearReward,
        introPurchase,
        ongoingPurchase,
        introBalanceTransfer,
        ongoingBalanceTransfer,
        foreignTranscationFees,
        balanceTransferFees,

        onChange,
        errors,
    }) => {
        const [offerSummaryOpen, setOfferSummaryOpen] = useState(false);
        const [offerValuationOpen, setOfferValuationOpen] = useState(false);
        const [aprOpen, setAprOpen] = useState(false);
        const [additionalOpen, setAdditionalOpen] = useState(false);

        return (
            <div className="space-y-4">

                {/* 🔹 Offer Summary */}
                <div className="bg-white rounded-xl border border-gray-200">
                    <div
                        onClick={() => setOfferSummaryOpen((v) => !v)}
                        className="flex justify-between px-4 py-3 cursor-pointer"
                    >
                        <h3 className="text-sm font-semibold text-gray-500">
                            Card Offer Summary
                        </h3>
                        
                        <span className="text-gray-500">{offerSummaryOpen ? "▲" : "▼"}</span>
                    </div>

                    {offerSummaryOpen && (
                        <div className="p-4 border-t border-gray-200">
                            <Field label="Welcome Offer" required error={errors.welcomeOffer}>
                                <Input
                                    name="welcomeOffer"
                                    value={welcomeOffer}
                                    onChange={onChange}
                                    placeholder="Enter welcome offer"
                                    error={errors.welcomeOffer}
                                />
                            </Field>
                        </div>
                    )}
                </div>

                {/* 🔹 Offer Valuation */}
                <div className="bg-white rounded-xl border border-gray-200">
                    <div
                        onClick={() => setOfferValuationOpen((v) => !v)}
                        className="flex justify-between px-4 py-3 cursor-pointer"
                    >
                        <h3 className="text-sm font-semibold text-gray-500">
                            Card Offer Valuation
                        </h3>
                        <span className="text-gray-500">{offerValuationOpen ? "▲" : "▼"}</span>
                    </div>

                    {offerValuationOpen && (
                        <div className="p-4 border-t border-gray-200">
                            <Field
                                label="First Year Rewards"
                                required
                                error={errors.firstYearReward}
                            >
                                <Input
                                    name="firstYearReward"
                                    value={firstYearReward}
                                    onChange={onChange}
                                    placeholder="Enter first year reward"
                                    error={errors.firstYearReward}
                                />
                            </Field>
                        </div>
                    )}
                </div>

                {/* 🔹 APR Section */}
                <div className="bg-white rounded-xl border border-gray-200">
                    <div
                        onClick={() => setAprOpen((v) => !v)}
                        className="flex justify-between px-4 py-3 cursor-pointer"
                    >
                        <h3 className="text-sm font-semibold text-gray-500">
                            Cards APR Offers
                        </h3>
                        <span className="text-gray-500">{aprOpen ? "▲" : "▼"}</span>
                    </div>

                    {aprOpen && (
                        <div className="p-4 border-t  border-gray-200 space-y-3">

                            <Field label="Intro Purchase APR" required error={errors.introPurchase}>
                                <Input
                                    name="introPurchase"
                                    value={introPurchase}
                                    onChange={onChange}
                                    placeholder="Enter intro purchase APR"
                                    error={errors.introPurchase}
                                />
                            </Field>

                            <Field label="Ongoing Purchase APR" required error={errors.ongoingPurchase}>
                                <Input
                                    name="ongoingPurchase"
                                    value={ongoingPurchase}
                                    onChange={onChange}
                                    placeholder="Enter ongoing purchase APR"
                                    error={errors.ongoingPurchase}
                                />
                            </Field>

                            <Field
                                label="Intro Balance Transfer APR"
                                required
                                error={errors.introBalanceTransfer}
                            >
                                <Input
                                    name="introBalanceTransfer"
                                    value={introBalanceTransfer}
                                    onChange={onChange}
                                    placeholder="Enter intro balance transfer APR"
                                    error={errors.introBalanceTransfer}
                                />
                            </Field>

                            <Field
                                label="Ongoing Balance Transfer APR"
                                required
                                error={errors.ongoingBalanceTransfer}
                            >
                                <Input
                                    name="ongoingBalanceTransfer"
                                    value={ongoingBalanceTransfer}
                                    onChange={onChange}
                                    placeholder="Enter ongoing balance transfer APR"
                                    error={errors.ongoingBalanceTransfer}
                                />
                            </Field>

                        </div>
                    )}
                </div>

                {/* 🔹 Additional Details */}
                <div className="bg-white rounded-xl border border-gray-200">
                    <div
                        onClick={() => setAdditionalOpen((v) => !v)}
                        className="flex justify-between px-4 py-3 cursor-pointer"
                    >
                        <h3 className="text-sm font-semibold text-gray-500">
                            Additional Card Details
                        </h3>
                        <span className="text-gray-500">{additionalOpen ? "▲" : "▼"}</span>
                    </div>

                    {additionalOpen && (
                        <div className="p-4 border-t border-gray-200 space-y-3">

                            <Field
                                label="Foreign Transaction Fees"
                                required
                                error={errors.foreignTranscationFees}
                            >
                                <Input
                                    name="foreignTranscationFees"
                                    value={foreignTranscationFees}
                                    onChange={onChange}
                                    placeholder="Enter foreign transaction fees"
                                    error={errors.foreignTranscationFees}
                                />
                            </Field>

                            <Field
                                label="Balance Transfer Fees"
                                required
                                error={errors.balanceTransferFees}
                            >
                                <Input
                                    name="balanceTransferFees"
                                    value={balanceTransferFees}
                                    onChange={onChange}
                                    placeholder="Enter balance transfer fees"
                                    error={errors.balanceTransferFees}
                                />
                            </Field>

                        </div>
                    )}
                </div>

            </div>
        );
    }
);

export default CardAdditionalDetails;