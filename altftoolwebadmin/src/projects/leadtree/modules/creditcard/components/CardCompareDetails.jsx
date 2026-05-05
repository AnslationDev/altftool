"use client";

import React, { memo } from "react";
import {
    Wallet2,
    CreditCard,
    ClipboardList,
    Speaker,
    FileText,
    AlertCircle,
} from "lucide-react";
import { Input } from "../styles/InputStyle";
import { Field } from "../styles/FieldStyle";



export const CardCompareDetails = memo(
    ({
        signupBonus,
        detailRewardRate,
        expertReview,
        goodFeature,
        badFeature,
        editorialNote,

        errors,
        onChange,

        cardHighlights,
        onHighlightChange,
        onAddHighlight,
    }) => {
        return (
            <div className="space-y-4">
              
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                        label="Add SignUp Bonus"
                        icon={<Wallet2 className="w-3.5 h-3.5" />}
                        required
                        error={errors.signupBonus}
                    >
                        <Input
                            name="signupBonus"
                            placeholder="Enter the sign up bonus"
                            value={signupBonus}
                            onChange={onChange}
                            error={errors.signupBonus}
                        />
                    </Field>

                    <Field
                        label="Add Detailed Reward Rate"
                        icon={<CreditCard className="w-3.5 h-3.5" />}
                        required
                        error={errors.detailRewardRate}
                    >
                        <Input
                            name="detailRewardRate"
                            placeholder="Enter the Reward Rate with benefits"
                            value={detailRewardRate}
                            onChange={onChange}
                            error={errors.detailRewardRate}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <Field
                        label="Add Card Highlights"
                        icon={<ClipboardList className="w-3.5 h-3.5" />}
                        required error={errors.cardHighlight}
                        
                    >
                        {cardHighlights.map((highlight, index) => (
                            <div key={index} className="mb-2">
                        
                                <Input
                                    as="textarea"
                                    rows={5}


                                    placeholder={`Enter highlight ${index + 1}`}
                                    value={highlight}
                                    onChange={(e) =>
                                        onHighlightChange(index, e.target.value)
                                    }
                                />
                            </div>
                        ))}

                        {errors.cardHighlight && (
                            <p className="flex items-center gap-1 text-xs text-red-500 font-medium mt-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.cardHighlight}
                            </p>
                        )}

                        <button
                            type="button"
                            className="text-blue-500 cursor-pointer hover:text-blue-600 font-medium text-[14px]"
                            onClick={onAddHighlight}
                        >
                            + Add More Highlights
                        </button>
                    </Field>
                </div>

              
                <Field
                    label="Add Expert Review"
                    icon={<Speaker className="w-3.5 h-3.5" />}
                    required
                    error={errors.expertReview}
                >
                        <Input
                                             as="textarea"
                                                     rows={4}
                        name="expertReview"
                        placeholder="Enter the expert review"
                        value={expertReview}
                        onChange={onChange}
                        error={errors.expertReview}
                    />
                </Field>

               
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                        label="Add Good Feature"
                        icon={<CreditCard className="w-3.5 h-3.5" />}
                        required
                        error={errors.goodFeature}
                    >
                            <Input
                                                 as="textarea"
                                                         rows={4}
                            name="goodFeature"
                            placeholder="Enter good feature"
                            value={goodFeature}
                            onChange={onChange}
                            error={errors.goodFeature}
                        />
                    </Field>

                    <Field
                        label="Add Bad Feature"
                        icon={<CreditCard className="w-3.5 h-3.5" />}
                        required
                        error={errors.badFeature}
                    >
                            <Input
                                                 as="textarea"
                                                         rows={4}
                            name="badFeature"
                            placeholder="Enter bad feature"
                            value={badFeature}
                            onChange={onChange}
                            error={errors.badFeature}
                        />
                    </Field>
                </div>

                      <Field
                    label="Add Editorial Note"
                    icon={<FileText className="w-3.5 h-3.5" />}
                    required
                    error={errors.editorialNote}
                >
                        <Input
                                             as="textarea"
                                                     rows={4}
                        name="editorialNote"
                        placeholder="Enter editorial note"
                        value={editorialNote}
                        onChange={onChange}
                        error={errors.editorialNote}
                    />
                </Field>
            </div>
        );
    }
);




