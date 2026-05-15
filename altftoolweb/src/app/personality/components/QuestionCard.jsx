"use client";

export default function QuestionCard({
  question,
}) {
  return (
    <div className="w-full max-w-4xl text-center">
      <h1 className="text-3xl md:text-5xl font-bold leading-[1.2] ">
        {question}
      </h1>

      <p className="mt-5 text-lg text-(--muted-foreground) ">
        How well does this statement describe you?
      </p>
    </div>
  );
}