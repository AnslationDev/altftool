import { useEffect, useRef, useState } from 'react'
import { makeParticles, meditationMessages } from '../utils/meditationData'
import { useMeditationAudio } from './useMeditationAudio'

export function useMeditationSession(inputRef) {
  const [thought, setThought] = useState('')
  const [savedThought, setSavedThought] = useState('')
  const [phase, setPhase] = useState('idle')
  const [visibleMessage, setVisibleMessage] = useState('')
  const [messageVisible, setMessageVisible] = useState(false)
  const [sparks, setSparks] = useState([])
  const timersRef = useRef([])
  const { startAudio, stopAudio } = useMeditationAudio()

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })

    return () => {
      clearTimers()
      stopAudio()
    }
  }, [])

  function addTimer(callback, delay) {
    const timer = window.setTimeout(callback, delay)
    timersRef.current.push(timer)
  }

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
  }

  function showMessage(text, hold = 5200) {
    setMessageVisible(false)
    addTimer(() => {
      setVisibleMessage(text)
      setMessageVisible(true)
    }, 120)
    addTimer(() => setMessageVisible(false), hold)
  }

  function beginMeditation() {
    const cleanThought = thought.trim()
    if (!cleanThought || phase !== 'idle') return

    clearTimers()
    setSavedThought(cleanThought)
    setPhase('grow')
    setSparks([])
    startAudio()
    addTimer(() => setPhase('shrinking'), 900)

    meditationMessages.forEach(([seconds, text]) => {
      addTimer(() => showMessage(text, seconds === 58 ? 7400 : 5200), seconds * 1000)
    })

    addTimer(() => {
      setPhase('gone')
      setSparks(makeParticles(42, true, Date.now() % 100000))
      stopAudio()
    }, 60000)

    addTimer(() => setPhase('ended'), 63500)
  }

  function resetMeditation() {
    clearTimers()
    stopAudio()
    setThought('')
    setSavedThought('')
    setVisibleMessage('')
    setMessageVisible(false)
    setSparks([])
    setPhase('idle')
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 80)
  }

  return {
    beginMeditation,
    isActive: phase !== 'idle',
    isEnded: phase === 'ended',
    isGone: phase === 'gone' || phase === 'ended',
    isShrinking: phase === 'shrinking' || phase === 'gone' || phase === 'ended',
    messageVisible,
    phase,
    resetMeditation,
    savedThought,
    startMeditationAudio: startAudio,
    setThought,
    sparks,
    thought,
    visibleMessage,
  }
}
