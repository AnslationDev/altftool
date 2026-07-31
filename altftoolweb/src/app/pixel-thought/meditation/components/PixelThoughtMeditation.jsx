'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMeditationSession } from '../hooks/useMeditationSession'
import styles from '../styles/PixelThoughtMeditation.module.css'
import { makeParticles, makeStars } from '../utils/meditationData'

export default function PixelThoughtMeditation() {
  const inputRef = useRef(null)
  const introTimersRef = useRef([])
  const stars = useMemo(() => makeStars(), [])
  const baseParticles = useMemo(() => makeParticles(34), [])
  const [introVisible, setIntroVisible] = useState(true)
  const [starReady, setStarReady] = useState(false)
  const {
    beginMeditation,
    isActive,
    isEnded,
    isGone,
    isShrinking,
    messageVisible,
    phase,
    resetMeditation,
    savedThought,
    setThought,
    sparks,
    startMeditationAudio,
    thought,
    visibleMessage,
  } = useMeditationSession(inputRef)

  useEffect(() => {
    return clearIntroTimers
  }, [])

  function addIntroTimer(callback, delay) {
    const timer = window.setTimeout(callback, delay)
    introTimersRef.current.push(timer)
  }

  function clearIntroTimers() {
    introTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    introTimersRef.current = []
  }

  function openThoughtStar() {
    if (!introVisible || starReady) return
    startMeditationAudio()
    setIntroVisible(false)
    addIntroTimer(() => {
      setStarReady(true)
      addIntroTimer(() => inputRef.current?.focus({ preventScroll: true }), 120)
    }, 700)
  }

  function restartMeditation() {
    clearIntroTimers()
    resetMeditation()
    setStarReady(false)
    setIntroVisible(true)
  }

  return (
    <main
      className={`${styles.app} notranslate relative isolate grid h-[100dvh] w-screen place-items-center overflow-hidden bg-[linear-gradient(180deg,#1b2735_0%,#090d14_45%,#000_100%)] text-white before:absolute before:in-[-8%] before:-z-30 before:bg-[radial-gradient(circle_at_45%_45%,rgba(120,144,190,0.11),transparent_27%),radial-gradient(circle_at_64%_28%,rgba(255,245,210,0.04),transparent_18%),linear-gradient(145deg,rgba(27,39,53,0.88),#000_66%)] before:content-['']`}
      translate="no"
      aria-label="A 60 second thought dissolving meditation"
    >
      <Link
        href="/"
        className="absolute left-4 top-4 z-30 text-sm font-light tracking-[0.08em] text-white/50 transition hover:text-white/80 focus-visible:text-white/80 focus-visible:outline-none max-[600px]:left-3 max-[600px]:top-3"
      >
        AltFTool
      </Link>

      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden bg-[radial-gradient(circle_at_50%_43%,rgba(70,88,122,0.28),transparent_28%),radial-gradient(circle_at_20%_10%,rgba(57,86,126,0.22),transparent_35%),radial-gradient(circle_at_80%_90%,rgba(35,49,82,0.18),transparent_38%)]">
        {stars.map((star) => (
          <span
            key={star.id}
            className={`${styles.spaceStar} absolute rounded-full bg-white shadow-[0_0_calc(var(--size)*4)_rgba(255,255,255,0.72)]`}
            style={{
              left: star.left,
              top: star.top,
              width: 'var(--size)',
              height: 'var(--size)',
              opacity: 'var(--opacity)',
              '--size': star.size,
              '--opacity': star.opacity,
              '--speed': star.speed,
              '--drift-x': star.driftX,
              '--drift-y': star.driftY,
              '--drift-speed': star.driftSpeed,
              '--delay': star.delay,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {baseParticles.map((particle) => (
          <span
            key={particle.id}
            className={[
              'absolute left-1/2 top-1/2 rounded-full bg-[#fff7dc]/90 opacity-0 shadow-[0_0_12px_rgba(255,228,166,0.8)]',
              isShrinking && !isGone ? styles.particleRunning : '',
            ].join(' ')}
            style={{
              width: 'var(--p-size)',
              height: 'var(--p-size)',
              '--angle': particle.angle,
              '--p-size': particle.size,
              '--p-speed': particle.speed,
              '--p-delay': particle.delay,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {sparks.map((spark) => (
          <span
            key={spark.id}
            className={`${styles.spark} absolute left-1/2 top-1/2 rounded-full bg-[#fff7dc]/90 shadow-[0_0_12px_rgba(255,228,166,0.8)]`}
            style={{
              width: 'var(--p-size)',
              height: 'var(--p-size)',
              '--angle': spark.angle,
              '--distance': spark.distance,
              '--p-size': spark.size,
              '--p-delay': spark.delay,
            }}
          />
        ))}
      </div>

      <section className={`absolute inset-x-4 top-[12dvh] z-20 grid justify-items-center text-center transition-all duration-1000 max-[600px]:top-[14dvh] ${introVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-6 opacity-0'}`}>
        {/*
          The H1 was "Pixel Thoughts" and this sub-line was "A 60-second
          meditation tool to help clear your mind" — respectively the name and
          the verbatim tagline of a live third-party product (pixelthoughts.co).
          Both are replaced with copy that describes what this page does, so the
          H1 now matches the generic intent the metadata targets instead of
          announcing another company's brand as the heading of our page.
        */}
        <h1 className="m-0 text-[clamp(2.4rem,7vw,5.2rem)] font-light leading-none text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45),0_0_18px_rgba(255,255,255,0.16)]">
          60-Second Meditation
        </h1>
        <p className="mt-5 max-w-[760px] text-balance text-[clamp(1.08rem,2.9vw,1.55rem)] font-light leading-relaxed text-[#f7ecd2]/90 [text-shadow:0_0_16px_rgba(255,220,150,0.22)]">
          One minute, one worry, and a star to carry it away
        </p>
        <button
          type="button"
          onClick={openThoughtStar}
          className="mt-9 flex cursor-pointer items-center gap-3 rounded-full border border-white/15 bg-white/[0.045] px-5 py-3 shadow-[0_0_34px_rgba(255,255,255,0.08)] backdrop-blur-md transition hover:border-white/30 hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <span className="size-1.5 rounded-full bg-[#ffe7a8] shadow-[0_0_14px_rgba(255,231,168,0.85)]" />
          <p className={`${styles.pixelSans} m-0 text-[clamp(0.92rem,2.35vw,1.08rem)] font-light tracking-[0.08em] text-white/75`}>
            Put a stressful thought in the star
          </p>
          <span className="size-1.5 rounded-full bg-[#ffe7a8] shadow-[0_0_14px_rgba(255,231,168,0.85)]" />
        </button>
      </section>

      <section className={`relative grid h-[min(92vw,520px)] w-[min(92vw,520px)] place-items-center transition-all duration-1000 max-[600px]:h-screen max-[600px]:w-screen ${starReady ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`} aria-live="polite">
        <div
          className={[
            styles.thoughtStar,
            'relative grid size-[clamp(188px,34vw,270px)] place-items-center overflow-hidden rounded-full border border-[#ffad73]/85 bg-[radial-gradient(circle_at_50%_48%,#ededed_0%,#dfdfdf_52%,#cfcfcf_100%)] p-9 text-center text-white shadow-[0_0_18px_rgba(255,255,255,0.34),0_0_42px_rgba(255,143,75,0.7),0_0_105px_rgba(255,112,46,0.46),0_0_170px_rgba(255,126,56,0.22)] max-[600px]:size-[clamp(178px,62vw,238px)] max-[600px]:p-7',
            phase === 'idle' ? styles.idleStar : '',
            phase === 'grow' ? styles.growStar : '',
            isShrinking ? styles.shrinkingStar : '',
            isGone ? 'pointer-events-none opacity-0' : '',
          ].join(' ')}
        >
          <div className={`relative z-10 grid w-full place-items-center gap-4 transition-opacity duration-700 ${isActive ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
            <p className="m-0 text-[clamp(1.5rem,5vw,2.35rem)] font-normal leading-[1.08] text-[#5f5f5f] [text-shadow:0_1px_2px_rgba(255,255,255,0.75)]">
              What&apos;s on your mind?
            </p>
            <input
              ref={inputRef}
              className={`${styles.pixelSans} w-[min(82%,220px)] border-0 border-b border-[#777]/45 bg-transparent px-1 py-2 text-center text-[clamp(1rem,3vw,1.18rem)] font-normal text-[#4d4d4d] outline-none placeholder:text-[#8a8a8a] focus:border-[#555] [text-shadow:0_1px_1px_rgba(255,255,255,0.75)]`}
              value={thought}
              onChange={(event) => setThought(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') beginMeditation()
              }}
              type="text"
              maxLength={120}
              autoComplete="off"
              spellCheck="true"
              placeholder="Type your worry..."
              aria-label="Type your worry"
            />
          </div>

          <div className={`${styles.pixelSans} ${styles.textAnywhere} relative z-20 max-w-[72%] translate-y-1 text-center text-[clamp(0.95rem,2.5vw,1.18rem)] font-normal leading-[1.45] text-[#555] opacity-0 transition-all duration-1000 [text-shadow:0_1px_2px_rgba(255,255,255,0.65)] ${isActive ? 'translate-y-0 opacity-100' : ''}`}>
            {savedThought}
          </div>
        </div>

        <p className={`${styles.pixelSans} absolute left-1/2 top-[calc(50%+clamp(122px,22vw,174px))] z-10 m-0 -translate-x-1/2 text-sm font-light uppercase tracking-[0.08em] text-white/55 transition-opacity duration-700 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
          Press Enter
        </p>
      </section>

      <p
        className={[
          'pointer-events-none absolute left-1/2 top-[10dvh] z-20 m-0 w-[min(86vw,760px)] -translate-x-1/2 text-center text-[clamp(1.35rem,4.8vw,2.6rem)] font-normal leading-[1.22] text-white transition-[opacity,transform] duration-700 ease-in-out [text-shadow:0_1px_2px_rgba(0,0,0,0.45),0_0_10px_rgba(255,255,255,0.22)] max-[600px]:top-[8dvh]',
          messageVisible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
        ].join(' ')}
      >
        {visibleMessage}
      </p>

      <section className={`pointer-events-none absolute inset-0 z-30 grid place-items-center opacity-0 transition-opacity duration-[1600ms] ${isEnded ? 'pointer-events-auto opacity-100' : ''}`}>
        <button
          type="button"
          onClick={restartMeditation}
          className={`${styles.pixelSans} cursor-pointer rounded-full border border-white/35 bg-white/[0.04] px-7 py-3 text-[1.05rem] font-light text-white/85 shadow-[0_0_36px_rgba(255,255,255,0.12)] backdrop-blur-[10px] transition hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/[0.08] focus-visible:-translate-y-0.5 focus-visible:border-white/60 focus-visible:bg-white/[0.08] focus-visible:outline-none`}
        >
          Go again?
        </button>
      </section>
    </main>
  )
}
