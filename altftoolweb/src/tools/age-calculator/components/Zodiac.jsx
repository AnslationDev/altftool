"use client";

import React, { useState } from "react";

export default function ZodiacInfo() {

    const [birthDate, setBirthDate] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const today = new Date().toISOString().split("T")[0];

    const zodiacSigns = [
        { sign: "Capricorn", start: "12-22", end: "01-19" },
        { sign: "Aquarius", start: "01-20", end: "02-18" },
        { sign: "Pisces", start: "02-19", end: "03-20" },
        { sign: "Aries", start: "03-21", end: "04-19" },
        { sign: "Taurus", start: "04-20", end: "05-20" },
        { sign: "Gemini", start: "05-21", end: "06-20" },
        { sign: "Cancer", start: "06-21", end: "07-22" },
        { sign: "Leo", start: "07-23", end: "08-22" },
        { sign: "Virgo", start: "08-23", end: "09-22" },
        { sign: "Libra", start: "09-23", end: "10-22" },
        { sign: "Scorpio", start: "10-23", end: "11-21" },
        { sign: "Sagittarius", start: "11-22", end: "12-21" },
    ];

    const chineseZodiac = [
        "Monkey", "Rooster", "Dog", "Pig", "Rat", "Ox",
        "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat"
    ];

    const birthstones = {
        1: "Garnet",
        2: "Amethyst",
        3: "Aquamarine",
        4: "Diamond",
        5: "Emerald",
        6: "Pearl",
        7: "Ruby",
        8: "Peridot",
        9: "Sapphire",
        10: "Opal",
        11: "Topaz",
        12: "Turquoise",
    };

    const validateDate = (date) => {
        const d = new Date(date);
        const todayDate = new Date();
        const year = d.getFullYear();

        if (year.toString().length !== 4) return "Year must be exactly 4 digits.";
        if (year < 1900) return "Please enter a valid year after 1900.";
        if (d > todayDate) return "Birth date cannot be in the future.";
        return "";
    };

    const calculateZodiac = () => {
        setError("");
        setResult(null);

        if (!birthDate) {
            setError("Please select your birth date.");
            return;
        }

        const err = validateDate(birthDate);
        if (err) {
            setError(err);
            return;
        }

        const date = new Date(birthDate);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();

        const mmdd = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        let zodiac = "";

        zodiacSigns.forEach((z) => {
            if ((mmdd >= z.start && mmdd <= z.end) || (z.start > z.end && (mmdd >= z.start || mmdd <= z.end))) {
                zodiac = z.sign;
            }
        });

        const chinese = chineseZodiac[year % 12];
        const stone = birthstones[month];

        setResult({ zodiac, chinese, stone });
    };

    return (
        <div className=" w-full max-w-md mx-auto bg-[var(--background)] p-4 rounded-lg border border-[var(--border)]  text-(--muted-foreground)">

            <h3 className="font-light text-sm sm:text-2xl md:text-1xl text-center mb-3 tracking-tight">
  Zodiac Finder
</h3>

            <div className="space-y-3">

                <input
                    type="date"
                    max={today}
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full border border-[var(--border)] rounded p-2 bg-[var(--background)] text-(--muted-foreground)"
                />

                <button
                    onClick={calculateZodiac}
                    className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-2 rounded-md hover:brightness-110 transition"
                >
                    Find My Zodiac
                </button>

                {error && (
                    <div className="text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-center mt-3">
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded p-3">
                            <div className="text-sm text-[var(--muted-foreground)]">Zodiac</div>
                            <div className="text-lg sm:text-xl md:text-lg font-bold">{result.zodiac}</div>
                        </div>

                        <div className="bg-[var(--card)] border border-[var(--border)] rounded p-3">
                            <div className="text-sm text-[var(--muted-foreground)]">Chinese Zodiac</div>
                            <div className="text-lg sm:text-xl md:text-lg font-bold">{result.chinese}</div>
                        </div>

                        <div className="bg-[var(--card)] border border-[var(--border)] rounded p-3">
                            <div className="text-sm text-[var(--muted-foreground)]">Birthstone</div>
                            <div className="text-lg sm:text-xl md:text-lg font-bold">{result.stone}</div>
                        </div>
                    </div>
                )}

            </div>

        </div>
    );
}