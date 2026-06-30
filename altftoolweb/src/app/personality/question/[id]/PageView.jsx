"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Minimize
} from "lucide-react";

import { questions } from "../../data/questions";

import ProgressBar from "../../components/ProgressBar";
import QuestionCard from "../../components/QuestionCard";
import QuestionOptions from "../../components/QuestionOptions";

export default function QuestionPage() {
    const router = useRouter();


    const params = useParams();


    const questionId = Number(params.id);

    const [selected, setSelected] = useState("");


    const question = questions.find(
        (q) => q.id === questionId
    );


    useEffect(() => {
        const saved = localStorage.getItem(
            `personality-question-${questionId}`
        );

        if (saved) {
            setSelected(saved);
        } else {
            setSelected("");
        }
    }, [questionId]);


    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center text-3xl font-bold">
                Question not found
            </div>
        );
    }


    const handleNext = () => {
        if (!selected) return;

        // save answer
        localStorage.setItem(
            `personality-question-${questionId}`,
            selected
        );

        const nextId = questionId + 1;

        if (nextId <= questions.length) {
            router.push(
                `/personality/question/${nextId}`
            );
        } else {
            router.push("/personality/result");
        }
    };


    const handlePrevious = () => {
        if (questionId > 1) {
            router.push(
                `/personality/question/${questionId - 1}`
            );
        }
    };

    return (
        <section className="section">
            <div className="max-w-5xl mx-auto  rounded-[24px]   flex flex-col overflow-hidden">

                {/* HEADER */}
                <div className="relative px-6 md:px-10  flex items-center justify-center text-(--muted-foreground)">


                    {/* Progress */}
                    <div className="w-full max-w-3xl mx-auto flex justify-center items-center">
                        <ProgressBar
                            current={questionId}
                            total={questions.length}
                        />
                    </div>



                </div>

                {/* MAIN */}
               <div className="flex-1 flex flex-col items-center justify-between px-4 py-8 sm:py-10 md:px-10">

                    {/* Question */}
                    <QuestionCard
                        question={question.question}
                    />

                    {/* Options */}
                    <QuestionOptions
                        options={question.options}
                        selected={selected}
                        setSelected={setSelected}
                    />

                    {/* BUTTONS */}
                    <div
                        className="
                          w-full
                         max-w-3xl
                         mt-10
                         sm:mt-14
                         flex
                         flex-col
                         sm:flex-row
                         items-stretch
                         sm:items-center
                         justify-between
                         gap-4
                        "
                    >


                        <button
                            onClick={handlePrevious}
                            disabled={questionId === 1}
                            className="
    h-14
    w-full
    sm:w-auto
    px-7
    rounded-2xl
    border
    border-(--border)
    bg-(--background)
    flex
    items-center
    justify-center
    gap-3
    font-semibold
    disabled:opacity-40
"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Previous
                        </button>


                        <button
                            onClick={handleNext}
                            disabled={!selected}
                            className="
    h-14
    w-full
    sm:w-auto
    px-8
    rounded-2xl
    bg-(--primary)
    hover:bg-(--primary-hover)
    transition-all
    text-white
    font-semibold
    flex
    items-center
    justify-center
    gap-3
    disabled:opacity-50
"
                        >
                            {questionId === questions.length
                                ? "Finish Test"
                                : "Next Question"}

                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-10 flex items-center gap-2 text--(sm) text-(--muted-foreground)">
                        <ShieldCheck className="w-5 h-5 text-(--primary)" />

                        <span className="text-sm md:text-base">
                            Your responses are private and secure
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}