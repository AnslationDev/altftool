"use client"
import React, { useMemo, useState } from 'react';
import DropdownSelector from '../components/DropdownSelector';
import InputArea from '../components/InputArea';
import ResultView from '../components/ResultView';
import FormatDetector from '../components/FormatDetector';
import Hash from '../components/Hash';
import { getEncoderDecoder } from '../utils/encodeDecode';
import Features from '../components/Features';

export default function ToolHome() {
    const [inputText, setInputText] = useState('');
    const [encodingType, setEncodingType] = useState('base64-encode');
    const { outputText, error } = useMemo(() => {
        if (!inputText) return { outputText: '', error: '' };

        try {
            const processor = getEncoderDecoder(encodingType);
            return { outputText: processor(inputText), error: '' };
        } catch (err) {
            return { outputText: '', error: err.message };
        }
    }, [inputText, encodingType]);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
            {/* Hero Section */}
            <div className="text-center mb-5 mb-12 mt-[-10]">
                <h1 className="heading mb-4 text-center mt-[-30]">
                    Encode & Decode
                </h1>
                <p className="description text-(--secondary) text-2xl mt-2 text-center">
                    Professional tool for encoding and decoding text in multiple formats.<br />
                    Fast, secure, and completely free.
                </p>
            </div>

            {/* Main Tool Box */}
            <div className="w-full max-w-40xl bg-(--background) rounded-lg p-6 md:p-8 sm:p-10 mb-12 border border-(--border)">
                <div className="flex flex-col gap-8">

                    {/* 1. Header & Selector */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="w-full">
                            <DropdownSelector 
                                value={encodingType} 
                                onChange={setEncodingType} 
                            />
                        </div>
                    </div>

                    {/* 2. Input & Result */}
                    <div className="p-5">
                        <InputArea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onClear={() => setInputText('')}
                        />
                        <ResultView value={outputText} error={error} encodingType={encodingType} />
                    </div>

                    {/* 3. Format Detector */}
                    {inputText && (
                        <div className="pt-4 border-t border-(--border) animate-fade-in">
                            <FormatDetector data={inputText} />
                        </div>
                    )}

                    {/* 4. Hash Generator Panel */}
                    <div className="pt-6">
                        <Hash />
                    </div>
                </div>
            </div>

            <Features />
        </div>
    );
};
