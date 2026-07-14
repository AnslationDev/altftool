"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  ListChecks,
  RotateCcw,
  XCircle,
} from "lucide-react";

const quizCategories = [
  {
    id: "web-development",
    label: "Web Development",
    description: "HTML, CSS, JavaScript, React, and frontend fundamentals.",
    questions: [
      ["Which tag creates the main page heading?", ["<main>", "<h1>", "<title>", "<section>"], 1, "<h1> is the primary visible heading for a page or major document section."],
      ["Which CSS feature is best for responsive two-dimensional layouts?", ["Flexbox", "Grid", "Float", "Position fixed"], 1, "CSS Grid handles rows and columns together, making it ideal for two-dimensional layouts."],
      ["Which React hook stores local component state?", ["useEffect", "useMemo", "useState", "useRef"], 2, "useState stores local state and re-renders when that state changes."],
      ["What does semantic HTML improve?", ["Only color", "Accessibility and meaning", "Image size", "Server memory"], 1, "Semantic elements describe structure for browsers, search engines, and assistive technology."],
      ["Which method converts JSON text into a JavaScript object?", ["JSON.parse", "JSON.stringify", "Object.toJson", "parse.JSON"], 0, "JSON.parse reads a JSON string and returns a JavaScript value."],
      ["What should a button use for click actions?", ["<div>", "<button>", "<span>", "<label>"], 1, "A native button supports keyboard and accessibility behavior by default."],
      ["Which attribute connects a label to an input?", ["name", "for", "target", "rel"], 1, "The label for attribute points to the input id."],
      ["What is the purpose of alt text?", ["Style images", "Describe images", "Compress images", "Load scripts"], 1, "Alt text gives useful image meaning when images cannot be seen or loaded."],
      ["Which CSS unit is relative to the root font size?", ["px", "rem", "vh", "%"], 1, "rem is based on the root element font size."],
      ["Which React prop is needed for stable list rendering?", ["id", "key", "index", "ref"], 1, "key helps React identify which list items changed, moved, or were removed."],
      ["Which event fires when a form is submitted?", ["onClick", "onInput", "onSubmit", "onReady"], 2, "onSubmit handles form submission from buttons and keyboard submit actions."],
      ["What does CSS :focus-visible target?", ["Hovered links", "Keyboard-relevant focus", "Only disabled inputs", "Printed pages"], 1, ":focus-visible styles focus when it is useful, especially for keyboard navigation."],
    ],
  },
  {
    id: "general-knowledge",
    label: "General Knowledge",
    description: "Everyday facts across geography, science, history, and culture.",
    questions: [
      ["Which planet is known as the Red Planet?", ["Venus", "Mars", "Jupiter", "Mercury"], 1, "Mars looks reddish because of iron oxide on its surface."],
      ["What is the capital of Japan?", ["Seoul", "Tokyo", "Kyoto", "Osaka"], 1, "Tokyo is Japan's capital and largest metropolitan area."],
      ["Which gas do plants absorb during photosynthesis?", ["Oxygen", "Carbon dioxide", "Hydrogen", "Nitrogen"], 1, "Plants use carbon dioxide, water, and light to make food."],
      ["How many continents are commonly recognized?", ["5", "6", "7", "8"], 2, "The common school model recognizes seven continents."],
      ["Who wrote 'Romeo and Juliet'?", ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], 1, "William Shakespeare wrote the tragedy Romeo and Juliet."],
      ["Which ocean is the largest?", ["Atlantic", "Indian", "Pacific", "Arctic"], 2, "The Pacific Ocean is the largest ocean on Earth."],
      ["What is H2O commonly called?", ["Salt", "Water", "Oxygen", "Hydrogen"], 1, "H2O is the chemical formula for water."],
      ["Which country is famous for the Eiffel Tower?", ["Italy", "France", "Spain", "Germany"], 1, "The Eiffel Tower is in Paris, France."],
      ["How many sides does a hexagon have?", ["5", "6", "7", "8"], 1, "A hexagon has six sides."],
      ["Which organ pumps blood through the body?", ["Liver", "Heart", "Lung", "Kidney"], 1, "The heart pumps blood through the circulatory system."],
      ["Which metal is liquid at room temperature?", ["Mercury", "Gold", "Copper", "Iron"], 0, "Mercury is a metal that is liquid at room temperature."],
      ["Which language has the most native speakers?", ["English", "Spanish", "Mandarin Chinese", "Hindi"], 2, "Mandarin Chinese has the largest native-speaker population."],
    ],
  },
  {
    id: "science",
    label: "Science",
    description: "Core physics, biology, chemistry, and earth science concepts.",
    questions: [
      ["What force pulls objects toward Earth?", ["Friction", "Gravity", "Magnetism", "Tension"], 1, "Gravity attracts masses toward each other."],
      ["What is the basic unit of life?", ["Atom", "Cell", "Tissue", "Organ"], 1, "Cells are the basic structural and functional units of life."],
      ["Which particle has a negative charge?", ["Proton", "Neutron", "Electron", "Photon"], 2, "Electrons carry negative electric charge."],
      ["What scale measures acidity?", ["Richter", "pH", "Celsius", "Kelvin"], 1, "The pH scale measures how acidic or basic a solution is."],
      ["What is the center of an atom called?", ["Shell", "Nucleus", "Membrane", "Core"], 1, "The nucleus contains protons and neutrons."],
      ["Which vitamin is produced when skin gets sunlight?", ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"], 3, "Sunlight helps the body produce vitamin D."],
      ["What is the boiling point of water at sea level?", ["50°C", "75°C", "100°C", "125°C"], 2, "Pure water boils at 100°C at standard sea-level pressure."],
      ["Which organ is mainly responsible for breathing?", ["Heart", "Lungs", "Stomach", "Pancreas"], 1, "The lungs exchange oxygen and carbon dioxide."],
      ["What is Earth's natural satellite?", ["Mars", "The Moon", "Venus", "Titan"], 1, "The Moon is Earth's natural satellite."],
      ["Which state of matter has a fixed shape and volume?", ["Gas", "Liquid", "Solid", "Plasma"], 2, "Solids hold both shape and volume under normal conditions."],
      ["What do bees collect from flowers?", ["Salt", "Nectar", "Sand", "Carbon"], 1, "Bees collect nectar and pollen from flowers."],
      ["Which blood cells help fight infection?", ["Red blood cells", "White blood cells", "Platelets", "Plasma"], 1, "White blood cells are part of the immune system."],
    ],
  },
  {
    id: "aptitude",
    label: "Aptitude",
    description: "Quick reasoning, numbers, percentages, and logic practice.",
    questions: [
      ["What is 15% of 200?", ["15", "20", "30", "40"], 2, "15% of 200 is 0.15 x 200 = 30."],
      ["If 6 pens cost 90, what is the cost of 1 pen?", ["10", "12", "15", "18"], 2, "90 divided by 6 equals 15."],
      ["What comes next: 2, 4, 8, 16, ?", ["18", "24", "32", "36"], 2, "Each number doubles, so the next number is 32."],
      ["A train travels 120 km in 2 hours. What is its speed?", ["40 km/h", "50 km/h", "60 km/h", "80 km/h"], 2, "Speed is distance divided by time: 120 / 2 = 60 km/h."],
      ["What is the average of 4, 8, and 12?", ["6", "8", "10", "12"], 1, "The sum is 24, and 24 divided by 3 is 8."],
      ["If x + 5 = 12, what is x?", ["5", "6", "7", "8"], 2, "Subtract 5 from both sides to get x = 7."],
      ["Which number is prime?", ["21", "29", "35", "39"], 1, "29 has no positive divisors other than 1 and itself."],
      ["What is 9 squared?", ["18", "72", "81", "99"], 2, "9 squared means 9 x 9 = 81."],
      ["If a price rises from 100 to 120, what is the percentage increase?", ["10%", "15%", "20%", "25%"], 2, "The increase is 20 on a base of 100, so it is 20%."],
      ["What is the next odd number after 47?", ["48", "49", "50", "51"], 1, "Odd numbers increase by 2, so 49 comes after 47."],
      ["How many minutes are there in 2.5 hours?", ["120", "135", "150", "180"], 2, "2.5 x 60 = 150 minutes."],
      ["What is 3/4 as a percentage?", ["25%", "50%", "75%", "80%"], 2, "3 divided by 4 is 0.75, which is 75%."],
    ],
  },
  {
    id: "digital-marketing",
    label: "Digital Marketing",
    description: "SEO, content, analytics, campaigns, and growth basics.",
    questions: [
      ["What does SEO stand for?", ["Search Engine Optimization", "Social Email Outreach", "Site Editing Option", "Search Entry Order"], 0, "SEO means Search Engine Optimization."],
      ["Which metric shows ad clicks divided by impressions?", ["CPA", "CTR", "ROAS", "CPC"], 1, "CTR is click-through rate: clicks divided by impressions."],
      ["What is a landing page mainly built for?", ["Database backup", "Focused conversion", "Server monitoring", "Image storage"], 1, "Landing pages guide visitors toward one focused action."],
      ["Which tag is often shown as a search result title?", ["meta viewport", "title", "script", "canvas"], 1, "The title tag commonly appears as the search result headline."],
      ["What does CPC mean?", ["Cost per click", "Clicks per customer", "Campaign page copy", "Cost per channel"], 0, "CPC is the cost paid for each click."],
      ["Which tool category measures website traffic?", ["Analytics", "Compression", "Typography", "Hosting only"], 0, "Analytics tools measure traffic, behavior, and campaign performance."],
      ["What is a call to action?", ["A privacy policy", "A prompt to act", "A browser cache", "A file type"], 1, "A call to action asks users to take the next step."],
      ["Which channel uses subject lines and open rates?", ["Email marketing", "Print design", "Server logs", "DNS routing"], 0, "Email marketing tracks opens, clicks, and subject-line performance."],
      ["What is organic traffic?", ["Paid ad visits", "Unpaid search visits", "Internal team visits", "Offline leads"], 1, "Organic traffic comes from unpaid search results."],
      ["What does A/B testing compare?", ["Two versions", "Two passwords", "Two servers only", "Two invoices"], 0, "A/B testing compares variations to see which performs better."],
      ["Which metric counts users who complete a desired action?", ["Bounce", "Conversion", "Impression", "Latency"], 1, "A conversion is a completed goal such as signup, sale, or download."],
      ["What is a keyword in SEO?", ["A target search term", "A font style", "A color token", "A server region"], 0, "Keywords are terms users search for and content targets."],
    ],
  },
];

function buildQuestion(rawQuestion, categoryId, index) {
  const [question, options, answerIndex, explanation] = rawQuestion;
  return {
    id: `${categoryId}-${index + 1}`,
    question,
    options,
    answerIndex,
    explanation,
  };
}

function getCategoryById(categoryId) {
  return quizCategories.find((category) => category.id === categoryId) || quizCategories[0];
}

function buildQuestions(categoryId) {
  const category = getCategoryById(categoryId);
  return category.questions.map((question, index) => buildQuestion(question, category.id, index));
}

function emptyAnswers(length) {
  return Array.from({ length }, () => null);
}

function getPerformanceMessage(percentage) {
  if (percentage >= 90) return "Excellent work. You have a sharp command of this category.";
  if (percentage >= 70) return "Strong result. A quick review will polish the remaining gaps.";
  if (percentage >= 50) return "Good start. Review the missed answers and run it again.";
  return "Keep practicing. The review section shows exactly what to revisit.";
}

function StatCard({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="break-words text-xs font-semibold uppercase leading-4 text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function HeaderMetric({ label, value }) {
  return (
    <div className="min-w-[88px] flex-1 px-3 py-2 text-center">
      <p className="whitespace-normal text-[11px] font-semibold uppercase leading-4 text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold leading-6 text-[var(--foreground)]">{value}</p>
    </div>
  );
}

export default function ToolHome() {
  const [categoryId, setCategoryId] = useState(quizCategories[0].id);
  const questions = useMemo(() => buildQuestions(categoryId), [categoryId]);
  const activeCategory = getCategoryById(categoryId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => emptyAnswers(questions.length));
  const [isFinished, setIsFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || questions[0];
  const selectedAnswer = answers[currentIndex];
  const answeredCount = answers.filter((answer) => answer !== null).length;
  const progress = totalQuestions ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const result = useMemo(() => {
    const correct = questions.reduce(
      (count, question, index) => count + (answers[index] === question.answerIndex ? 1 : 0),
      0,
    );
    const skipped = answers.filter((answer) => answer === null).length;
    const wrong = totalQuestions - correct - skipped;
    const percentage = totalQuestions ? Math.round((correct / totalQuestions) * 100) : 0;

    return {
      correct,
      skipped,
      wrong,
      percentage,
      message: getPerformanceMessage(percentage),
    };
  }, [answers, questions, totalQuestions]);

  function resetQuiz(nextCategoryId = categoryId) {
    const nextQuestions = buildQuestions(nextCategoryId);
    setAnswers(emptyAnswers(nextQuestions.length));
    setCurrentIndex(0);
    setIsFinished(false);
    setShowReview(false);
  }

  function changeCategory(nextCategoryId) {
    setCategoryId(nextCategoryId);
    resetQuiz(nextCategoryId);
  }

  function selectAnswer(optionIndex) {
    if (isFinished) return;
    setAnswers((current) => current.map((answer, index) => (index === currentIndex ? optionIndex : answer)));
  }

  function goToPrevious() {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function goToNext() {
    if (currentIndex >= totalQuestions - 1) {
      setIsFinished(true);
      setShowReview(false);
      return;
    }
    setCurrentIndex((index) => Math.min(totalQuestions - 1, index + 1));
  }

  function skipQuestion() {
    if (isFinished) return;
    setAnswers((current) => current.map((answer, index) => (index === currentIndex ? null : answer)));
    goToNext();
  }

  if (!totalQuestions) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
        <section className="mx-auto max-w-4xl rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h1 className="text-3xl font-semibold">Quiz App</h1>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">No quiz questions are available.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <CircleHelp className="h-4 w-4" />
            Educational tool
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:items-end">
            <div className="min-w-0">
              <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Quiz App</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                Build a quick practice quiz, answer one question at a time, and review every result with the correct
                explanation.
              </p>
            </div>
            <div className="grid min-w-0 grid-cols-3 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
              <HeaderMetric label="Questions" value={totalQuestions} />
              <HeaderMetric label="Score" value={result.correct} />
              <HeaderMetric label="Progress" value={`${progress}%`} />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--primary)]">Choose category</p>
              <h2 className="mt-1 text-xl font-semibold">{activeCategory.label}</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{activeCategory.description}</p>
            </div>
            <span className="text-sm font-semibold text-[var(--muted-foreground)]">{totalQuestions}+ questions</span>
          </div>

          <div className="tool-card-grid mt-4">
            {quizCategories.map((category) => {
              const isActive = category.id === categoryId;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => changeCategory(category.id)}
                  aria-pressed={isActive}
                  className={`min-h-[112px] rounded-lg border p-4 text-left transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] ${
                    isActive
                      ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <span className="text-sm font-semibold">{category.label}</span>
                  <span className="mt-2 block text-xs leading-5 text-[var(--muted-foreground)]">{category.description}</span>
                  <span className="mt-3 inline-flex rounded-full bg-[var(--card)] px-2 py-1 text-xs font-semibold text-[var(--primary)]">
                    {category.questions.length} questions
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {!isFinished ? (
          <section className="mt-6 grid gap-6 2xl:grid-cols-[320px_1fr]">
            <aside className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Progress</p>
                <span className="text-sm font-semibold text-[var(--primary)]">{progress}%</span>
              </div>
              <div
                className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--muted)]"
                role="progressbar"
                aria-label="Quiz progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${progress}%` }} />
              </div>

              <div className="tool-compact-grid mt-5">
                <StatCard label="Answered" value={answeredCount} />
                <StatCard label="Remaining" value={totalQuestions - answeredCount} />
              </div>

              <div className="mt-5 grid grid-cols-6 gap-2 sm:grid-cols-8 2xl:grid-cols-5" aria-label="Question status">
                {questions.map((question, index) => {
                  const isCurrent = index === currentIndex;
                  const isAnswered = answers[index] !== null;
                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`h-10 rounded-md border text-sm font-semibold transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] ${
                        isCurrent
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : isAnswered
                            ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                      aria-label={`Go to question ${index + 1}${isAnswered ? ", answered" : ", not answered"}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {activeCategory.label} - Single correct answer
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-snug">{currentQuestion.question}</h2>

              <fieldset className="mt-6 space-y-3">
                <legend className="sr-only">Choose one answer</legend>
                {currentQuestion.options.map((option, optionIndex) => {
                  const isSelected = selectedAnswer === optionIndex;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectAnswer(optionIndex)}
                      aria-pressed={isSelected}
                      className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] ${
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-sm font-semibold">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span className="font-medium">{option}</span>
                    </button>
                  );
                })}
              </fieldset>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={goToPrevious} disabled={currentIndex === 0} className="btn-secondary">
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={skipQuestion} className="btn-secondary">
                    Skip Question
                  </button>
                  <button type="button" onClick={goToNext} className="btn-primary">
                    {currentIndex === totalQuestions - 1 ? "Finish Quiz" : "Next"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>
          </section>
        ) : (
          <section className="mt-6 grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--primary)]">
                  <ListChecks className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Final result</p>
                  <h2 className="text-2xl font-semibold">{result.percentage}% Score</h2>
                </div>
              </div>

              <div className="tool-compact-grid mt-6">
                <StatCard label="Total questions" value={totalQuestions} />
                <StatCard label="Correct answers" value={result.correct} />
                <StatCard label="Wrong answers" value={result.wrong} />
                <StatCard label="Skipped" value={result.skipped} />
              </div>

              <p className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.message}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => resetQuiz()} className="btn-primary">
                  <RotateCcw className="h-4 w-4" />
                  Restart Quiz
                </button>
                <button type="button" onClick={() => setShowReview((value) => !value)} className="btn-secondary">
                  {showReview ? "Hide Review" : "Review Answers"}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-xl font-semibold">Answer review</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {showReview
                  ? "Compare each selected answer against the correct answer."
                  : "Open review to inspect correct, incorrect, and skipped questions."}
              </p>

              {showReview ? (
                <div className="mt-5 space-y-4">
                  {questions.map((question, index) => {
                    const answer = answers[index];
                    const isSkipped = answer === null;
                    const isCorrect = answer === question.answerIndex;
                    return (
                      <article key={question.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[var(--anslation-ds-success)]" />
                          ) : (
                            <XCircle className="mt-1 h-5 w-5 shrink-0 text-[var(--anslation-ds-danger)]" />
                          )}
                          <div>
                            <h3 className="font-semibold leading-6">
                              {index + 1}. {question.question}
                            </h3>
                            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                              Your answer: {isSkipped ? "Skipped" : question.options[answer]}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                              Correct answer: {question.options[question.answerIndex]}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{question.explanation}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 text-sm text-[var(--muted-foreground)]">
                  Review is collapsed.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
