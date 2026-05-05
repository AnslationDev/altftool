"use client";

import React, { memo } from "react";
import {
    Type,
    FileText,
    Gauge,
    CreditCard,
    Calendar,
    Banknote,
    SquareArrowOutUpRight,
    AlertCircle,
} from "lucide-react";


import CreditCardCateogry from "./CreditCardCateogry";
import CreditCardBenefit from "./CreditCardBenefit";
import { Field } from "../add-cards/common-ui/FieldsStyle";
import { Input } from "../add-cards/common-ui/InputStyle";

const CardBasicDetails = ({
    heading,
    category,
    creditscore,
    cardBenefit,
    date,
    rewardRate,
    annualFee,
    regularApr,
    applyLink,
    bottomLine,
    ourTake,
    cardDetails,

    errors,
    CreditScore,
    cardsExtraInfo,

    onChange,
    onCategoryChange,
    onBenefitChange,
    onToggleExtraInfo,
}) => {
    return (
        <div className="space-y-6">

            {/* Heading */}
            <Field label="Card Heading" icon={<Type />} required error={errors.heading}>
                <Input name="heading" value={heading} onChange={onChange} />
            </Field>

            {/* Category + Score */}
            <div className="grid grid-cols-2 gap-4">
                <Field label="Card Category" required error={errors.category}>
                    <CreditCardCateogry value={category} onChange={onCategoryChange} />
                </Field>

                <Field label="Card Credit Score" required error={errors.creditscore}>
                    <select
                        name="creditscore"
                        value={creditscore || ""}
                        onChange={onChange}
                        className="w-full border px-2 py-2"
                    >
                        <option value="">Select</option>
                        {CreditScore.map((item, i) => (
                            <option key={i} value={item}>{item}</option>
                        ))}
                    </select>
                </Field>
            </div>

            {/* Benefit + Date */}
            <div className="grid grid-cols-2 gap-4">
                <Field label="Card Benefit" required error={errors.cardBenefit}>
                    <CreditCardBenefit value={cardBenefit} onChange={onBenefitChange} />
                </Field>

                <Field label="Display Date" required error={errors.date}>
                    <Input type="date" name="date" value={date} onChange={onChange} />
                </Field>
            </div>

            {/* Reward + Fee */}
            <div className="grid grid-cols-2 gap-4">
                <Field label="Reward Rate" required error={errors.rewardRate}>
                    <Input name="rewardRate" value={rewardRate} onChange={onChange} />
                </Field>

                <Field label="Annual Fee" required error={errors.annualFee}>
                    <Input name="annualFee" value={annualFee} onChange={onChange} />
                </Field>
            </div>

            {/* Extra Info */}
            <div className="border rounded-xl">
                <div onClick={onToggleExtraInfo} className="flex justify-between p-3 cursor-pointer">
                    <span>Card Extra Info</span>
                    <span>{cardsExtraInfo ? "▲" : "▼"}</span>
                </div>

                {cardsExtraInfo && (
                    <div className="p-4 space-y-4 border-t">

                        <div className="grid grid-cols-2 gap-4">
                            <Input name="regularApr" value={regularApr} onChange={onChange} placeholder="APR" />
                            <Input name="applyLink" value={applyLink} onChange={onChange} placeholder="URL" />
                        </div>

                        <Input name="bottomLine" value={bottomLine} onChange={onChange} placeholder="Bottom line" />
                        <Input name="ourTake" value={ourTake} onChange={onChange} placeholder="Our take" />
                        <Input name="cardDetails" value={cardDetails} onChange={onChange} placeholder="Details" />

                    </div>
                )}
            </div>

        </div>
    );
};

export default memo(CardBasicDetails);