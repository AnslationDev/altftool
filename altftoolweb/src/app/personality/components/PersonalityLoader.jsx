"use client";

import {
    ShieldCheck,
    Sparkles,
    MousePointer2,
    Brain,
} from "lucide-react";

import { useEffect } from "react";

export default function PersonalityLoader() {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, []);

    const radius = 92;
    const circumference = 2 * Math.PI * radius;

    return (
        <section className="fixed inset-0 z-[9999] personality-page flex items-center justify-center px-4 overflow-hidden bg-black/20 backdrop-blur-md pointer-events-auto">
            <div
                className="
                bg-(--card)
          relative
          w-full
          max-w-3xl
          rounded-[28px]
sm:rounded-[36px]
md:rounded-[40px]
          border border-(--border)
          shadow-[var(--anslation-ds-shadow-lg)]
          p-4
sm:p-6
          md:p-10
          overflow-hidden
          max-h-[95vh]
        "
            >

                {/* Top Badge */}
                <div className="relative z-10 flex justify-center mb-6 sm:mb-8
md:mb-12">
                    <div
                        className="
              inline-flex
              items-center
              gap-2
              px-4
sm:px-5
md:px-6
py-2.5
sm:py-3
              rounded-full
             personality-pill
              font-semibold
           text-[13px]
sm:text-[15px]
md:text-[18px]
              shadow-sm
            "
                    >
                        <Sparkles className="w-4 h-4 fill-(--primary)" />

                        Preparing Your Test
                    </div>
                </div>

                {/* Loader */}
                <div className="relative z-10 flex flex-col items-center text-center">

                    <div className="relative w-[180px]  w-[180px]
    h-[180px]
    sm:w-[220px]
    sm:h-[220px]
    md:w-[240px]
    md:h-[240px]
    group
    cursor-pointer">


                        <div className="absolute inset-0 rounded-full  blur-2xl scale-110" />


                        <svg   viewBox="0 0 240 240" className="w-full h-full -rotate-90 animate-spin [animation-duration:1.4s]">

                            <circle
                               cx="50%"
cy="50%"
                                r={radius}
                                stroke="var(--border)"
                                strokeWidth="10"
                                fill="none"
                            />


                            <circle
                                cx="120"
                                cy="120"
                                r={radius}
                                stroke="var(--primary)"
                                strokeWidth="10"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference * 0.75}
                            />
                        </svg>

                        <div className="absolute inset-0 flex items-center justify-center -translate-y-2">
                            <div className=" w-16
    h-16
    sm:w-20
    sm:h-20
    md:w-24
    md:h-24 rounded-full bg-(--primary)/10 flex items-center justify-center shadow-lg">
                                <Brain className=" w-8
    h-8
    sm:w-10
    sm:h-10
    md:w-12
    md:h-12 text-(--primary)" />
                            </div>
                        </div>
                    </div>


                    <h2 className="mt-12 text-[24px]
sm:text-3xl
md:text-4xl
px-2 font-bold tracking-tight  leading-[1.1] ">
                        Preparing Your Personality Test
                    </h2>


                    <p className="mt-5 text-(--muted-foreground) text-sm
sm:text-base
md:text-lg
px-2 font-normal max-w-[520px] leading-[1.8]">
                        Just a moment while we get your test ready.
                    </p>

                    {/* Footer */}
                    <div className="mt-12 flex items-center justify-center gap-2 text-(--muted-foreground) text-sm md:text-base">
                        <ShieldCheck className="w-5 h-5 text-(--primary)" />
                        <span>Secure • Private • Confidential</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
