"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@altftool/ui';
import { articlesData, quizById } from '../data';
import { playbuzzAds } from '../ads';

const FALLBACK_QUESTIONS = [
  { id: 1, text: 'What word does this spell backwards? DLROW', options: ['SWORD', 'WORLD', 'WORDS', 'LOWER'], correctIndex: 1 },
  { id: 2, image: 'https://picsum.photos/seed/q2img/760/300', text: 'Read this backwards and pick what you see: DESSERT', options: ['DESERT', 'RESTED', 'TRESSED', 'STRESS'], correctIndex: 2 },
  { id: 3, text: 'Which of these reads the same forwards AND backwards?', options: ['LEVEL UP', 'RACECAR', 'MIRROR', 'FORWARD'], correctIndex: 1 },
  { id: 4, image: 'https://picsum.photos/seed/q4img/760/300', text: 'What does ENIM spell forwards?', options: ['MINI', 'MINE', 'MEAN', 'MILE'], correctIndex: 1 },
  { id: 5, text: 'Reverse this phrase: OT EROT — What animal do you see?', options: ['Bear', 'Tiger', 'Tore To', 'Otter'], correctIndex: 2 },
];

const YouMightAlsoLike = ({ relatedArticles }) => (
  <div className="mt-8 pb-10">
    <hr className="border-t border-border m-0 mb-6" />
    <div className="text-xs font-bold uppercase tracking-wider mb-3.5" style={{ color: 'var(--foreground)' }}>You Might Also Like</div>
    <div className="grid grid-cols-3 max-md:grid-cols-2 max-[480px]:grid-cols-1 gap-4">
      {relatedArticles.map((article) => (
        <Link
          href={`/playbuzz/quiz-play?id=${article.id}`}
          key={article.id}
          className="group block no-underline border border-border rounded-md overflow-hidden bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm hover:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
          style={{ color: 'inherit' }}
        >
          <div className="relative w-full pb-[56.25%] overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
            <img src={article.image} alt={article.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
          <div className="px-3.5 py-3 border-t border-border">
            <div className="text-sm font-bold text-center leading-tight mb-1.5" style={{ color: 'var(--foreground)' }}>{article.title}</div>
            {article.plays ? (
              <div className="text-xs font-normal text-center" style={{ color: 'var(--muted-foreground)' }}>{article.plays}</div>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  </div>
);

const MiddleContentAd = ({ ad }) => {
  if (!ad) return null;
  return (
    <div className="my-6 w-full">
      <a
        href={ad.href}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block w-full border border-border rounded-md overflow-hidden bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
        style={{ boxShadow: 'var(--anslation-ds-shadow-sm)' }}
      >
        <img src={ad.image} alt={ad.alt || 'Advertisement'} className="w-full object-cover block" style={{ height: 'clamp(140px, 24vw, 260px)' }} />
        {ad.label && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold tracking-wide text-white px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}>
            {ad.label}
          </span>
        )}
      </a>
    </div>
  );
};

const QuizPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '1';
  const articleId = parseInt(id, 10);

  const quizData = useMemo(() => {
    const quiz = quizById[articleId];
    if (quiz) {
      return {
        title: quiz.title,
        image: quiz.heroImage || quiz.cardImage,
        plays: quiz.plays,
        category: quiz.category,
        questions: quiz.questions?.length ? quiz.questions : FALLBACK_QUESTIONS,
      };
    }
    return {
      title: 'Only Highly Gifted People Can Read Backwards. Can You?',
      image: 'https://picsum.photos/seed/forest-path/1200/600',
      category: 'Trivia',
      questions: FALLBACK_QUESTIONS,
    };
  }, [articleId]);

  const quizMeta = useMemo(
    () =>
      [
        quizData.plays,
        `${quizData.questions.length} questions`,
        quizData.category || 'Trivia',
      ].filter(Boolean),
    [quizData],
  );

  const relatedArticles = useMemo(() => {
    const sameCategory = articlesData.filter((a) => a.id !== articleId && a.category === quizData.category).slice(0, 2);
    const otherCategory = articlesData.filter((a) => a.id !== articleId && a.category !== quizData.category).slice(0, 2);
    return [...sameCategory, ...otherCategory];
  }, [articleId, quizData.category]);

  const [gameState, setGameState] = useState('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);

  const leftAds = useMemo(() => {
    if (!playbuzzAds?.length) return [];
    const verticals = playbuzzAds.filter(ad => ad.type === 'vertical');
    return verticals.length > 0 ? verticals.slice(0, 1) : playbuzzAds.slice(0, 1);
  }, []);

  const safeRightAds = useMemo(() => {
    if (!playbuzzAds?.length) return [];
    const verticals = playbuzzAds.filter(ad => ad.type === 'vertical');
    if (verticals.length > 1) return verticals.slice(1, 2);
    const leftAdId = leftAds[0]?.id;
    return playbuzzAds.filter((ad) => ad.id !== leftAdId).slice(0, 1);
  }, [leftAds]);

  const horizontalAd = useMemo(() => {
    if (!playbuzzAds?.length) return null;
    return playbuzzAds.find(ad => ad.type === 'horizontal-long') || playbuzzAds[0];
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setGameState('intro');
    setCurrentQuestionIdx(0);
    setScore(0);
    setHasAnswered(false);
    setSelectedOptionIdx(null);
  }, [id]);

  const handleStart = () => {
    setGameState('playing');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleOptionClick = (idx) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setSelectedOptionIdx(idx);
    if (idx === quizData.questions[currentQuestionIdx].correctIndex) setScore((prev) => prev + 1);
  };

  const handleNext = () => {
    if (currentQuestionIdx < quizData.questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setHasAnswered(false);
      setSelectedOptionIdx(null);
    } else {
      setGameState('result');
    }
  };

  const handleRetake = () => {
    setGameState('intro');
    setCurrentQuestionIdx(0);
    setScore(0);
    setHasAnswered(false);
    setSelectedOptionIdx(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getResultInfo = () => {
    const pct = score / quizData.questions.length;
    if (pct >= 0.8) return { title: "You're Exceptionally Gifted!", desc: 'Remarkable! You scored in the very top tier.' };
    if (pct >= 0.5) return { title: 'Above Average — Well Done!', desc: 'Great job! You scored above average and show strong cognitive flexibility.' };
    return { title: 'Backwards Thinking Is Hard!', desc: 'This test is genuinely difficult. Keep practicing and try again.' };
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/playbuzz/quiz-play?id=${articleId}`;
  };

  const handleFacebookShare = () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer,width=650,height=500');
  };

  const handleShareResult = async () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    const resultInfo = getResultInfo();
    const shareText = `${quizData.title} - I scored ${score}/${quizData.questions.length}. ${resultInfo.title}`;
    if (navigator.share) {
      try { await navigator.share({ title: quizData.title, text: shareText, url: shareUrl }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(shareUrl); window.alert('Quiz link copied. You can paste and share it.'); }
    catch { window.prompt('Copy this quiz link:', shareUrl); }
  };

  const handleTwitterShare = () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    const resultInfo = getResultInfo();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${quizData.title} - I scored ${score}/${quizData.questions.length}. ${resultInfo.title}`)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer,width=650,height=500');
  };

  const handleInstagramShare = async () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    try { await navigator.clipboard.writeText(shareUrl); window.open('https://www.instagram.com/', '_blank'); window.alert('Quiz link copied. Paste it in your Instagram bio, story, or DM.'); }
    catch { window.open('https://www.instagram.com/', '_blank'); window.prompt('Copy this quiz link for Instagram:', shareUrl); }
  };

  const renderQuestion = () => {
    const q = quizData.questions[currentQuestionIdx];
    return (
      <div>
        <div className="text-sm uppercase tracking-wider font-semibold mb-2.5" style={{ color: 'var(--muted-foreground)' }}>
          Question {currentQuestionIdx + 1} of {quizData.questions.length}
        </div>
        <div className="text-4xl max-md:text-[22px] font-extrabold mb-5 leading-tight" style={{ color: 'var(--foreground)' }}>
          {q.text}
        </div>
        <div className="flex flex-col gap-3">
          {q.options.map((opt, idx) => {
            let btnClass = 'w-full py-3.5 px-3.5 text-lg font-bold text-left rounded-md border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none';
            if (hasAnswered) {
              if (idx === q.correctIndex) {
                btnClass += ' border-[var(--anslation-ds-success)]';
              } else if (idx === selectedOptionIdx) {
                btnClass += ' border-[var(--anslation-ds-danger)]';
              } else {
                btnClass += ' opacity-40 cursor-not-allowed';
              }
            } else {
              btnClass += ' hover:border-[var(--primary)]';
            }
            const bgColor = hasAnswered
              ? idx === q.correctIndex
                ? 'var(--anslation-ds-success-soft)'
                : idx === selectedOptionIdx
                  ? 'var(--anslation-ds-danger-soft)'
                  : 'var(--card)'
              : 'var(--card)';
            const textColor = hasAnswered
              ? idx === q.correctIndex
                ? 'var(--anslation-ds-success)'
                : idx === selectedOptionIdx
                  ? 'var(--anslation-ds-danger)'
                  : 'var(--foreground)'
              : 'var(--foreground)';
            return (
              <button
                key={idx}
                className={btnClass}
                style={{
                  backgroundColor: bgColor,
                  borderColor: 'var(--border)',
                  color: textColor,
                }}
                onClick={() => handleOptionClick(idx)}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSideAd = (ad, key) => (
    <a
      key={key}
      href={ad.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-border rounded-md overflow-hidden bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
      style={{ boxShadow: 'var(--anslation-ds-shadow-sm)' }}
    >
      <img src={ad.image} alt={ad.alt || 'Advertisement'} className="w-full object-cover block" style={{ height: 'min(60vh, 520px)', minHeight: '360px' }} />
      {ad.label && (
        <span className="absolute top-2 left-2 text-[10px] font-semibold tracking-wide text-white px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}>
          {ad.label}
        </span>
      )}
    </a>
  );

  return (
    <div className="w-full pt-10 max-md:pt-5" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="flex justify-center items-start mx-auto gap-4 w-full px-4 box-border" style={{ maxWidth: 'var(--anslation-ds-container-wide)' }}>
        {playbuzzAds?.length > 0 && (
          <div className="w-60 max-xl:w-48 max-lg:w-40 max-lg:hidden shrink-0" aria-label="Sponsored ad left">
            <div className="sticky top-24 flex flex-col gap-4">
              {leftAds.map((ad, index) => (
                <div key={`${ad.id}-left-${index}`} className="relative">
                  {renderSideAd(ad, `${ad.id}-left-${index}`)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full max-w-[860px] max-md:max-w-full px-10 max-md:px-4 py-10 max-md:py-5 bg-card flex flex-col min-h-[70vh] border border-border rounded-lg mb-10 max-md:mb-0 max-md:border-none max-md:rounded-none" style={{ boxShadow: 'var(--anslation-ds-shadow-sm)' }}>
          {gameState === 'intro' && (
            <>
              <div className="flex flex-col items-center text-center pb-2.5">
                <div className="flex flex-wrap items-center gap-2 mb-5 text-sm w-full justify-start" style={{ color: 'var(--muted-foreground)' }}>
                  {quizMeta.map((part, idx) => (
                    <span key={`${idx}-${part}`} className="flex items-center gap-2">
                      {idx > 0 && <span aria-hidden="true">&middot;</span>}
                      <span>{part}</span>
                    </span>
                  ))}
                </div>
                <div className="w-full rounded-md overflow-hidden mb-6" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <img src={quizData.image} alt={quizData.title} className="w-full h-auto block object-cover" />
                </div>
                <h1 className="text-3xl font-extrabold leading-tight mb-6 max-w-full" style={{ color: 'var(--foreground)' }}>{quizData.title}</h1>
                <Button variant="primary" size="lg" onClick={handleStart}>
                  Start Quiz
                </Button>
              </div>
              <MiddleContentAd ad={horizontalAd} />
              <YouMightAlsoLike relatedArticles={relatedArticles} />
            </>
          )}

          {gameState === 'playing' && (
            <div className="w-full pb-6">
              <div className="w-full h-2 rounded overflow-hidden mb-6" style={{ backgroundColor: 'var(--muted)' }}>
                <div
                  className="h-full transition-all duration-300 rounded"
                  style={{ width: `${(currentQuestionIdx / quizData.questions.length) * 100}%`, backgroundColor: 'var(--primary)' }}
                />
              </div>
              {renderQuestion()}
              {hasAnswered && (
                <div className="mt-5 text-center">
                  <Button variant="primary" onClick={handleNext}>
                    {currentQuestionIdx === quizData.questions.length - 1 ? 'See Results' : 'Next Question'}
                  </Button>
                </div>
              )}
              <MiddleContentAd ad={horizontalAd} />
              <YouMightAlsoLike relatedArticles={relatedArticles} />
            </div>
          )}

          {gameState === 'result' && (() => {
            const resultInfo = getResultInfo();
            return (
              <>
                <div className="text-center px-4 pb-6 bg-transparent border-none">
                  <div className="text-5xl font-extrabold mb-2.5" style={{ color: 'var(--primary)' }}>
                    {score}/{quizData.questions.length}
                  </div>
                  <div className="text-4xl max-md:text-[28px] font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                    {resultInfo.title}
                  </div>
                  <p className="text-base max-w-[600px] mx-auto mb-8 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {resultInfo.desc}
                  </p>
                  <div className="flex justify-center gap-4 flex-wrap">
                    <button
                      className="inline-flex items-center gap-2 px-6 py-3 rounded text-white font-semibold text-sm border-none cursor-pointer focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
                      style={{ backgroundColor: '#1877f2' }}
                      onClick={handleFacebookShare}
                    >
                      <span className="w-[22px] h-[22px] rounded-full inline-flex items-center justify-center text-[11px] font-bold uppercase leading-none" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} aria-hidden="true">f</span>
                      Share on Facebook
                    </button>
                    <button
                      className="inline-flex items-center gap-2 px-6 py-3 rounded text-white font-semibold text-sm border-none cursor-pointer focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
                      style={{ backgroundColor: '#1da1f2' }}
                      onClick={handleTwitterShare}
                    >
                      <span className="w-[22px] h-[22px] rounded-full inline-flex items-center justify-center text-[11px] font-bold uppercase leading-none" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} aria-hidden="true">x</span>
                      Share on Twitter
                    </button>
                    <button
                      className="inline-flex items-center gap-2 px-6 py-3 rounded text-white font-semibold text-sm border-none cursor-pointer focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
                      style={{ backgroundColor: '#e1306c' }}
                      onClick={handleInstagramShare}
                    >
                      <span className="w-[22px] h-[22px] rounded-full inline-flex items-center justify-center text-[11px] font-bold uppercase leading-none" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} aria-hidden="true">ig</span>
                      Share on Instagram
                    </button>
                    <button
                      className="btn-secondary inline-flex items-center gap-2 px-6 py-3 rounded font-semibold text-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
                      onClick={handleShareResult}
                    >
                      <span className="w-[22px] h-[22px] rounded-full inline-flex items-center justify-center text-[11px] font-bold uppercase leading-none" style={{ backgroundColor: 'var(--muted)' }} aria-hidden="true">lnk</span>
                      Copy Quiz Link
                    </button>
                    <Button variant="secondary" onClick={handleRetake}>
                      Retake Quiz
                    </Button>
                  </div>
                </div>
                <MiddleContentAd ad={horizontalAd} />
                <YouMightAlsoLike relatedArticles={relatedArticles} />
              </>
            );
          })()}
        </div>

        {safeRightAds?.length > 0 && (
          <div className="w-60 max-xl:w-48 max-lg:w-40 max-lg:hidden shrink-0" aria-label="Sponsored ad right">
            <div className="sticky top-24 flex flex-col gap-4">
              {safeRightAds.map((ad, index) => (
                <div key={`${ad.id}-right-${index}`} className="relative">
                  {renderSideAd(ad, `${ad.id}-right-${index}`)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
