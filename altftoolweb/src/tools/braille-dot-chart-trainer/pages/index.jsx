"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Grip, RotateCcw, Shuffle } from "lucide-react";

import {
  DEFAULT_QUIZ_LENGTH,
  DOT_LAYOUT,
  MAX_TEXT_LENGTH,
  QUIZ_MODES,
  buildChart,
  buildQuiz,
  gradeChoice,
  gradeDots,
  identifyCell,
  summarizeScore,
  transliterate,
} from "../lib";

const DEFAULT_TEXT = "Braille 26";
const START_SEED = 20260728;
const QUIZ_LENGTHS = [5, 10, 26];
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function StaticCell({ dots, size = "md" }) {
  const raised = new Set(dots || []);
  const dotSize = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  return (
    <span className={`inline-grid grid-cols-2 ${size === "sm" ? "gap-1" : "gap-1.5"}`} aria-hidden="true">
      {DOT_LAYOUT.map((entry) => (
        <span
          key={entry.dot}
          className={`${dotSize} rounded-full ${
            raised.has(entry.dot) ? "bg-[var(--primary)]" : "bg-[var(--muted)] ring-1 ring-[var(--border)]"
          }`}
        />
      ))}
    </span>
  );
}

export default function ToolHome() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [pressed, setPressed] = useState([1, 2, 5]);
  const [quizMode, setQuizMode] = useState(QUIZ_MODES[0].id);
  const [quizLength, setQuizLength] = useState(String(DEFAULT_QUIZ_LENGTH));
  const [seed, setSeed] = useState(START_SEED);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [quizDots, setQuizDots] = useState([]);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => transliterate(text), [text]);
  const explorer = useMemo(() => identifyCell(pressed), [pressed]);
  const chart = useMemo(() => buildChart(), []);

  const quiz = useMemo(
    () => buildQuiz({ mode: quizMode, count: Number(quizLength), seed }),
    [quizMode, quizLength, seed],
  );
  const questions = quiz.error ? [] : quiz.questions;
  const current = questions[index] || null;
  const finished = !quiz.error && index >= questions.length;

  const feedback = useMemo(() => {
    if (!checked || !current) return null;
    if (current.mode === "letter-to-dots") return gradeDots(current, quizDots);
    if (choice === null) return null;
    return gradeChoice(current, choice);
  }, [checked, current, choice, quizDots]);

  const score = useMemo(
    () => summarizeScore({ correct: correctCount, total: answeredCount }),
    [correctCount, answeredCount],
  );

  const toggleDot = (dot) => {
    setPressed((current2) =>
      current2.includes(dot) ? current2.filter((value) => value !== dot) : current2.concat(dot).sort((a, b) => a - b),
    );
  };

  const toggleQuizDot = (dot) => {
    if (checked) return;
    setQuizDots((current2) =>
      current2.includes(dot) ? current2.filter((value) => value !== dot) : current2.concat(dot).sort((a, b) => a - b),
    );
  };

  const restartQuiz = (nextSeed) => {
    setSeed(nextSeed);
    setIndex(0);
    setChoice(null);
    setQuizDots([]);
    setChecked(false);
    setCorrectCount(0);
    setAnsweredCount(0);
  };

  const checkQuiz = () => {
    if (!current || checked) return;
    const graded =
      current.mode === "letter-to-dots" ? gradeDots(current, quizDots) : gradeChoice(current, choice);
    if (graded.error) return;
    setChecked(true);
    setAnsweredCount((value) => value + 1);
    if (graded.isCorrect) setCorrectCount((value) => value + 1);
  };

  const nextQuestion = () => {
    setIndex((value) => value + 1);
    setChoice(null);
    setQuizDots([]);
    setChecked(false);
  };

  const summaryText = useMemo(() => {
    if (result.error) return "";
    return [
      "Braille (uncontracted / grade 1)",
      `Text: ${text}`,
      `Braille: ${result.braille}`,
      `Cells: ${result.cellCount} (${result.indicatorCount} indicator cells)`,
      "",
      ...result.cells.map((cell) => `${cell.source} = dots ${cell.label}`),
    ].join("\n");
  }, [result, text]);

  const copyResult = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setText(DEFAULT_TEXT);
    setPressed([1, 2, 5]);
    setQuizMode(QUIZ_MODES[0].id);
    setQuizLength(String(DEFAULT_QUIZ_LENGTH));
    restartQuiz(START_SEED);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Grip className="h-4 w-4" aria-hidden="true" />
          Six-dot cell
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Braille Dot Chart Trainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every braille character is a pattern of six dots: 1, 2, 3 down the left column and 4, 5, 6
          down the right. Type text to see the cells, press dots to find out what they spell, and
          quiz yourself on all 26 letters.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="braille-text">
          Text to transliterate (uncontracted braille)
        </label>
        <input
          id="braille-text"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          autoComplete="off"
          maxLength={MAX_TEXT_LENGTH}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Letters, digits and the marks , ; : . ? ! &apos; - are supported.
        </p>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Braille cells needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Braille output", "Indicator cells", "Characters skipped"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Braille cells needed
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{result.cellCount}</p>
              <p className="mt-1 break-words text-2xl leading-relaxed">{result.braille}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy the braille transliteration"
                className={GHOST_BTN}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy braille"}
              </button>
              <button type="button" onClick={reset} aria-label="Reset everything" className={GHOST_BTN}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Indicator cells (capital / number / letter signs)", String(result.indicatorCount)],
              ["Characters skipped", result.unsupported.length ? result.unsupported.join(" ") : "None"],
              ["System", "Uncontracted English braille (grade 1)"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap gap-3">
            {result.cells.map((cell) => (
              <div
                key={cell.key}
                className="flex min-w-[64px] flex-col items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2"
                title={cell.note}
              >
                <StaticCell dots={cell.dots} size="sm" />
                <span className="text-xs font-semibold">{cell.role === "space" ? "␣" : cell.source}</span>
                <span className="text-[10px] text-[var(--muted-foreground)]">{cell.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Press the dots</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Toggle any of the six positions to see which character that cell makes.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="grid grid-cols-2 gap-2">
            {DOT_LAYOUT.map((entry) => {
              const on = pressed.includes(entry.dot);
              return (
                <button
                  key={entry.dot}
                  type="button"
                  onClick={() => toggleDot(entry.dot)}
                  aria-pressed={on}
                  aria-label={`Dot ${entry.dot}`}
                  className={`h-11 w-11 rounded-full text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    on
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {entry.dot}
                </button>
              );
            })}
          </div>
          <div>
            <p className="text-4xl">{explorer.unicode}</p>
            <p className="mt-1 text-sm font-semibold">Dots {explorer.label}</p>
            {explorer.unassigned ? (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                No letter, digit or supported mark uses this pattern.
              </p>
            ) : (
              <ul className="mt-1 space-y-1 text-sm text-[var(--muted-foreground)]">
                {explorer.matches.map((match) => (
                  <li key={`${match.kind}-${match.char}`}>
                    <span className="font-semibold text-[var(--foreground)]">{match.char}</span> — {match.note}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Quiz</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="braille-quiz-mode">
              Quiz mode
            </label>
            <select
              id="braille-quiz-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={quizMode}
              onChange={(event) => {
                setQuizMode(event.target.value);
                restartQuiz(seed + 1);
              }}
            >
              {QUIZ_MODES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="braille-quiz-length">
              Questions
            </label>
            <select
              id="braille-quiz-length"
              className={`mt-2 ${INPUT_CLASS}`}
              value={quizLength}
              onChange={(event) => {
                setQuizLength(event.target.value);
                restartQuiz(seed + 1);
              }}
            >
              {QUIZ_LENGTHS.map((value) => (
                <option key={value} value={String(value)}>
                  {value} letters
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => restartQuiz(seed + 1)} className={GHOST_BTN}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            New round
          </button>
          <p className="text-sm text-[var(--muted-foreground)]">
            Score: {score.error ? DASH : `${score.correct}/${score.total} (${score.percent}%) · ${score.band}`}
          </p>
        </div>

        {quiz.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {quiz.error}
          </p>
        ) : finished ? (
          <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-sm font-semibold">Round complete</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {score.error ? "No questions were answered." : score.message}
            </p>
            <button type="button" onClick={() => restartQuiz(seed + 1)} className={`mt-3 ${PRIMARY_BTN}`}>
              Start a new round
            </button>
          </div>
        ) : (
          current && (
            <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Question {index + 1} of {questions.length}
              </p>

              {current.mode === "cell-to-letter" && (
                <div className="mt-3 flex items-center gap-4">
                  <StaticCell dots={current.dots} />
                  <p className="text-sm">Which letter is this cell?</p>
                </div>
              )}
              {current.mode === "dots-to-letter" && (
                <p className="mt-3 text-sm">
                  Which letter is made from dots{" "}
                  <span className="font-semibold text-[var(--foreground)]">{current.label}</span>?
                </p>
              )}
              {current.mode === "letter-to-dots" && (
                <p className="mt-3 text-sm">
                  Press the dots for the letter{" "}
                  <span className="text-2xl font-semibold text-[var(--primary)]">{current.char.toUpperCase()}</span>
                </p>
              )}

              {current.mode === "letter-to-dots" ? (
                <div className="mt-4 grid w-fit grid-cols-2 gap-2">
                  {DOT_LAYOUT.map((entry) => {
                    const on = quizDots.includes(entry.dot);
                    return (
                      <button
                        key={entry.dot}
                        type="button"
                        onClick={() => toggleQuizDot(entry.dot)}
                        aria-pressed={on}
                        aria-label={`Quiz dot ${entry.dot}`}
                        className={`h-11 w-11 rounded-full text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                          on
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        {entry.dot}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {current.options.map((option, optionIndex) => {
                    const picked = choice === optionIndex;
                    const isAnswer = checked && optionIndex === current.answerIndex;
                    const isWrong = checked && picked && optionIndex !== current.answerIndex;
                    const tone = isAnswer
                      ? "border-[var(--success)] text-[var(--success)]"
                      : isWrong
                        ? "border-[var(--danger)] text-[var(--danger)]"
                        : picked
                          ? "border-[var(--primary)]"
                          : "border-[var(--border)]";
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={checked}
                        onClick={() => setChoice(optionIndex)}
                        className={`min-h-11 rounded-md border bg-[var(--card)] px-3 text-left text-sm font-semibold transition ${tone}`}
                      >
                        {option.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              )}

              {feedback && !feedback.error && (
                <div
                  className={`mt-4 rounded-md px-3 py-3 text-sm leading-6 ${
                    feedback.isCorrect
                      ? "bg-[var(--muted)] text-[var(--foreground)]"
                      : "bg-[var(--danger-soft)] text-[var(--danger)]"
                  }`}
                  role="status"
                >
                  <p className="font-semibold">
                    {feedback.isCorrect
                      ? "Correct."
                      : current.mode === "letter-to-dots"
                        ? `Not quite. Missing dots: ${feedback.missing.length ? feedback.missing.join("-") : "none"}; extra dots: ${feedback.extra.length ? feedback.extra.join("-") : "none"}.`
                        : `Not quite — the answer is ${feedback.answer.toUpperCase()}.`}
                  </p>
                  <p className="mt-1">{feedback.hint}</p>
                </div>
              )}

              <div className="mt-4">
                {checked ? (
                  <button type="button" onClick={nextQuestion} className={PRIMARY_BTN}>
                    {index + 1 >= questions.length ? "See results" : "Next letter"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={checkQuiz}
                    className={PRIMARY_BTN}
                    disabled={current.mode === "letter-to-dots" ? quizDots.length === 0 : choice === null}
                  >
                    Check answer
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Reference chart</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          a-j use only the top four dots. k-t repeat a-j with dot 3 added. u, v, x, y and z repeat
          a-e with dots 3 and 6 added. w sits outside the pattern.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Character</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Cell</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Dots</th>
                <th scope="col" className="py-2 font-semibold">Group</th>
              </tr>
            </thead>
            <tbody>
              {chart.letters.map((entry) => (
                <tr key={`l-${entry.char}`} className="border-b border-[var(--border)]">
                  <td className="py-2 pr-3 font-semibold uppercase">{entry.char}</td>
                  <td className="py-2 pr-3 text-xl">{entry.unicode}</td>
                  <td className="py-2 pr-3">{entry.label}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{entry.line.label}</td>
                </tr>
              ))}
              {chart.punctuation.map((entry) => (
                <tr key={`p-${entry.char}`} className="border-b border-[var(--border)]">
                  <td className="py-2 pr-3 font-semibold">{entry.char}</td>
                  <td className="py-2 pr-3 text-xl">{entry.unicode}</td>
                  <td className="py-2 pr-3">{entry.label}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">Punctuation</td>
                </tr>
              ))}
              {chart.indicators.map((entry) => (
                <tr key={`i-${entry.key}`} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{entry.name}</td>
                  <td className="py-2 pr-3 text-xl">{entry.unicode}</td>
                  <td className="py-2 pr-3">{entry.label}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{entry.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This trainer uses uncontracted (grade 1) English braille. Published books normally use
        contracted grade 2 braille, which abbreviates common words and letter groups and is not
        produced here. Screen output is also not a substitute for embossed dots — real braille is
        read by touch.
      </p>
    </main>
  );
}
