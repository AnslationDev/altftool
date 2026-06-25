"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { articlesData, quizById } from '../data';
import { playbuzzAds } from '../ads';
import './QuizPage.css';

const FALLBACK_QUESTIONS = [
  { id: 1, text: 'What word does this spell backwards? DLROW', options: ['SWORD', 'WORLD', 'WORDS', 'LOWER'], correctIndex: 1 },
  { id: 2, image: 'https://picsum.photos/seed/q2img/760/300', text: 'Read this backwards and pick what you see: DESSERT', options: ['DESERT', 'RESTED', 'TRESSED', 'STRESS'], correctIndex: 2 },
  { id: 3, text: 'Which of these reads the same forwards AND backwards?', options: ['LEVEL UP', 'RACECAR', 'MIRROR', 'FORWARD'], correctIndex: 1 },
  { id: 4, image: 'https://picsum.photos/seed/q4img/760/300', text: 'What does ENIM spell forwards?', options: ['MINI', 'MINE', 'MEAN', 'MILE'], correctIndex: 1 },
  { id: 5, text: 'Reverse this phrase: OT EROT — What animal do you see?', options: ['Bear', 'Tiger', 'Tore To', 'Otter'], correctIndex: 2 }
];

const YouMightAlsoLike = ({ relatedArticles }) => (
  <div className="ymal-section">
    <hr className="ymal-separator" />
    <div className="ymal-heading">You Might Also Like</div>
    <div className="ymal-grid">
      {relatedArticles.map((article) => (
        <Link href={`/playbuzz/quiz-play?id=${article.id}`} key={article.id} className="ymal-card">
          <div className="ymal-card-image">
            <img src={article.image} alt={article.title} loading="lazy" />
          </div>
          <div className="ymal-card-body">
            <div className="ymal-card-title">{article.title}</div>
            <div className="ymal-card-creator">{article.author} · {article.plays}</div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

const MiddleContentAd = ({ ad }) => {
  if (!ad) return null;
  return (
    <div className="quiz-middle-ad">
      <a href={ad.href} target="_blank" rel="noopener noreferrer" className="quiz-middle-ad-card">
        <img src={ad.image} alt={ad.alt || 'Advertisement'} className="quiz-middle-ad-image" />
        {ad.label && <span className="quiz-middle-ad-label">{ad.label}</span>}
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
        author: quiz.author,
        image: quiz.heroImage || quiz.cardImage,
        plays: quiz.plays,
        category: quiz.category,
        questions: quiz.questions?.length ? quiz.questions : FALLBACK_QUESTIONS
      };
    }

    return {
      title: 'Only Highly Gifted People Can Read Backwards. Can You?',
      author: 'Terry Stein',
      image: 'https://picsum.photos/seed/forest-path/1200/600',
      plays: '2.4M plays',
      category: 'Trivia',
      questions: FALLBACK_QUESTIONS
    };
  }, [articleId]);

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

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    window.scrollTo(0, 0);
    setGameState('intro');
    setCurrentQuestionIdx(0);
    setScore(0);
    setHasAnswered(false);
    setSelectedOptionIdx(null);
  }, [id]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=650,height=500');
  };

  const handleShareResult = async () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;

    const resultInfo = getResultInfo();
    const shareText = `${quizData.title} - I scored ${score}/${quizData.questions.length}. ${resultInfo.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: quizData.title,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (error) {
        // User may cancel native share popup, then we silently fall back.
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      window.alert('Quiz link copied. You can paste and share it.');
    } catch (error) {
      window.prompt('Copy this quiz link:', shareUrl);
    }
  };

  const handleTwitterShare = () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    const resultInfo = getResultInfo();
    const text = `${quizData.title} - I scored ${score}/${quizData.questions.length}. ${resultInfo.title}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=650,height=500');
  };

  const handleInstagramShare = async () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      window.alert('Quiz link copied. Paste it in your Instagram bio, story, or DM.');
    } catch (error) {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      window.prompt('Copy this quiz link for Instagram:', shareUrl);
    }
  };

  return (
    <div className="quiz-page-outer">
      <div className="quiz-layout-container">
        {/* Left Column for Ads */}
        {playbuzzAds?.length > 0 && (
          <div className="quiz-side-column left-column" aria-label="Sponsored ad left">
            <div className="quiz-sticky-ad">
              {leftAds.map((ad, index) => (
                <a
                  key={`${ad.id}-left-${index}`}
                  href={ad.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quiz-side-ad-card"
                >
                  <img src={ad.image} alt={ad.alt || 'Advertisement'} className="quiz-side-ad-image" />
                  {ad.label && <span className="quiz-side-ad-label">{ad.label}</span>}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Center Main Quiz Content */}
        <div className="quiz-page-container">
          {gameState === 'intro' && (
            <>
              <div className="quiz-intro-section">
                <div className="quiz-meta-top">
                  <div className="quiz-avatar"><img src="https://picsum.photos/seed/avatar1/64/64" alt="Author" /></div>
                  <div className="quiz-meta-text">
                    <span className="quiz-author">by <strong>{quizData.author}</strong></span>
                    <span className="quiz-dot">·</span><span>{quizData.plays}</span>
                    <span className="quiz-dot">·</span><span>{quizData.questions.length} questions</span>
                    <span className="quiz-dot">·</span><span className="quiz-category-tag">{quizData.category || 'Trivia'}</span>
                  </div>
                </div>
                <div className="quiz-hero-image"><img src={quizData.image} alt={quizData.title} /></div>
                <h1 className="quiz-title">{quizData.title}</h1>
                <button className="start-quiz-btn" onClick={handleStart}>Start Quiz</button>
              </div>
              <MiddleContentAd ad={horizontalAd} />
              <YouMightAlsoLike relatedArticles={relatedArticles} />
            </>
          )}

          {gameState === 'playing' && (
            <div className="quiz-playing-section">
              <div className="pb-progress-bar-wrap"><div className="pb-progress-bar" style={{ width: `${(currentQuestionIdx / quizData.questions.length) * 100}%` }} /></div>
              <div className="pb-question">
                <div className="pb-question-num">Question {currentQuestionIdx + 1} of {quizData.questions.length}</div>
                <div className="pb-question-text">{quizData.questions[currentQuestionIdx].text}</div>
                <div className="pb-answers">
                  {quizData.questions[currentQuestionIdx].options.map((opt, idx) => {
                    let cls = 'pb-answer';
                    if (hasAnswered) {
                      if (idx === quizData.questions[currentQuestionIdx].correctIndex) cls += ' correct';
                      else if (idx === selectedOptionIdx) cls += ' wrong';
                      else cls += ' faded';
                    }
                    return <button key={idx} className={cls} onClick={() => handleOptionClick(idx)}>{opt}</button>;
                  })}
                </div>
              </div>
              {hasAnswered && <div className="pb-quiz-nav"><button className="pb-next-btn" onClick={handleNext}>{currentQuestionIdx === quizData.questions.length - 1 ? 'See Results' : 'Next Question'}</button></div>}
              <MiddleContentAd ad={horizontalAd} />
              <YouMightAlsoLike relatedArticles={relatedArticles} />
            </div>
          )}

          {gameState === 'result' && (() => {
            const resultInfo = getResultInfo();
            return (
              <>
                <div className="pb-result-screen">
                  <div className="pb-result-score">{score}/{quizData.questions.length}</div>
                  <div className="pb-result-label">{resultInfo.title}</div>
                  <p className="pb-result-desc">{resultInfo.desc}</p>
                  <div className="pb-result-share">
                    <button className="pb-result-share-btn fb" onClick={handleFacebookShare}><span className="share-icon">f</span>Share on Facebook</button>
                    <button className="pb-result-share-btn tw" onClick={handleTwitterShare}><span className="share-icon">x</span>Share on Twitter</button>
                    <button className="pb-result-share-btn ig" onClick={handleInstagramShare}><span className="share-icon">ig</span>Share on Instagram</button>
                    <button className="pb-result-share-btn copy" onClick={handleShareResult}><span className="share-icon">lnk</span>Copy Quiz Link</button>
                    <button className="pb-result-share-btn retake" onClick={handleRetake}><span className="share-icon">r</span>Retake Quiz</button>
                  </div>
                </div>
                <MiddleContentAd ad={horizontalAd} />
                <YouMightAlsoLike relatedArticles={relatedArticles} />
              </>
            );
          })()}
        </div>

        {/* Right Column for Ads */}
        {safeRightAds?.length > 0 && (
          <div className="quiz-side-column right-column" aria-label="Sponsored ad right">
            <div className="quiz-sticky-ad">
              {safeRightAds.map((ad, index) => (
                <a
                  key={`${ad.id}-right-${index}`}
                  href={ad.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quiz-side-ad-card"
                >
                  <img src={ad.image} alt={ad.alt || 'Advertisement'} className="quiz-side-ad-image" />
                  {ad.label && <span className="quiz-side-ad-label">{ad.label}</span>}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
