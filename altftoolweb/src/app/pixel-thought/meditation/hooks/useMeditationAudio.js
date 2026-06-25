import { useEffect, useRef } from 'react'

export function useMeditationAudio() {
  const audioRef = useRef({
    context: null,
    gain: null,
    nodes: [],
    bellTimer: null,
    background: null,
  })

  useEffect(() => {
    function handleVisibility() {
      const { context, nodes } = audioRef.current
      if (!context || !nodes?.length) return
      if (document.hidden && context.state === 'running') context.suspend()
      if (!document.hidden && context.state === 'suspended') context.resume()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  function startAudio() {
    try {
      const background = audioRef.current.background || new Audio('/sounds/forest.mp3')
      background.loop = true
      background.volume = 0.42
      background.preload = 'auto'
      audioRef.current.background = background
      background.play().catch(() => {})

      const Context = window.AudioContext || window.webkitAudioContext
      if (!Context) return

      if (audioRef.current.context && audioRef.current.nodes?.length) {
        if (audioRef.current.context.state === 'suspended') {
          audioRef.current.context.resume()
        }
        return
      }

      const context = audioRef.current.context || new Context()
      if (context.state === 'suspended') context.resume()

      const masterGain = context.createGain()
      const droneFilter = context.createBiquadFilter()
      const omFormantO = context.createBiquadFilter()
      const omFormantM = context.createBiquadFilter()
      const airFilter = context.createBiquadFilter()
      const airGain = context.createGain()
      const notes = [
        { frequency: 108, volume: 0.015 },
        { frequency: 216, volume: 0.012 },
        { frequency: 256.87, volume: 0.005 },
        { frequency: 324, volume: 0.004 },
        { frequency: 384.87, volume: 0.004 },
        { frequency: 432, volume: 0.0035 },
      ]

      droneFilter.type = 'lowpass'
      droneFilter.frequency.value = 760
      droneFilter.Q.value = 0.6
      omFormantO.type = 'bandpass'
      omFormantO.frequency.value = 430
      omFormantO.Q.value = 6
      omFormantM.type = 'bandpass'
      omFormantM.frequency.value = 185
      omFormantM.Q.value = 9
      airFilter.type = 'bandpass'
      airFilter.frequency.value = 720
      airFilter.Q.value = 0.35
      airGain.gain.value = 0.009
      masterGain.gain.setValueAtTime(0.0001, context.currentTime)
      masterGain.gain.exponentialRampToValueAtTime(0.11, context.currentTime + 3)
      droneFilter.connect(masterGain)
      omFormantO.connect(masterGain)
      omFormantM.connect(masterGain)
      airFilter.connect(airGain)
      airGain.connect(masterGain)
      masterGain.connect(context.destination)

      const nodes = notes.flatMap((note, index) => {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        const tremolo = context.createOscillator()
        const tremoloGain = context.createGain()

        oscillator.type = index < 2 ? 'sine' : 'triangle'
        oscillator.frequency.value = note.frequency
        oscillator.detune.value = index % 2 === 0 ? -3 : 3
        gain.gain.value = note.volume
        tremolo.type = 'sine'
        tremolo.frequency.value = 0.045 + index * 0.012
        tremoloGain.gain.value = note.volume * 0.34
        tremolo.connect(tremoloGain)
        tremoloGain.connect(gain.gain)
        oscillator.connect(gain)
        gain.connect(droneFilter)
        oscillator.start()
        tremolo.start()

        return [oscillator, tremolo]
      })

      const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
      const noiseData = noiseBuffer.getChannelData(0)
      for (let index = 0; index < noiseData.length; index += 1) {
        noiseData[index] = (Math.random() * 2 - 1) * 0.18
      }

      const noise = context.createBufferSource()
      noise.buffer = noiseBuffer
      noise.loop = true
      noise.connect(airFilter)
      noise.start()
      nodes.push(noise)

      function createOmVoice(baseFrequency, volume, detune = 0) {
        const carrier = context.createOscillator()
        const sub = context.createOscillator()
        const omGain = context.createGain()
        const oGain = context.createGain()
        const mGain = context.createGain()
        const breath = context.createOscillator()
        const breathGain = context.createGain()
        const now = context.currentTime

        carrier.type = 'sawtooth'
        sub.type = 'sine'
        breath.type = 'sine'
        carrier.frequency.value = baseFrequency
        sub.frequency.value = baseFrequency / 2
        carrier.detune.value = detune
        sub.detune.value = detune / 2
        breath.frequency.value = 1 / 9
        omGain.gain.setValueAtTime(0.0001, now)
        omGain.gain.linearRampToValueAtTime(volume, now + 2.2)
        oGain.gain.setValueAtTime(volume * 0.95, now)
        mGain.gain.setValueAtTime(volume * 0.28, now)
        breathGain.gain.value = volume * 0.32
        carrier.connect(omGain)
        sub.connect(omGain)
        breath.connect(breathGain)
        breathGain.connect(omGain.gain)
        omGain.connect(oGain)
        omGain.connect(mGain)
        oGain.connect(omFormantO)
        mGain.connect(omFormantM)
        carrier.start()
        sub.start()
        breath.start()

        return [carrier, sub, breath]
      }

      nodes.push(...createOmVoice(136.1, 0.018, -5))
      nodes.push(...createOmVoice(136.1, 0.012, 6))
      nodes.push(...createOmVoice(102.08, 0.01, 0))

      function playBell() {
        if (context.state === 'closed') return
        const now = context.currentTime
        const bellGain = context.createGain()
        const fundamental = context.createOscillator()
        const overtone = context.createOscillator()

        bellGain.gain.setValueAtTime(0.0001, now)
        bellGain.gain.exponentialRampToValueAtTime(0.045, now + 0.04)
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8)
        fundamental.type = 'sine'
        overtone.type = 'sine'
        fundamental.frequency.value = 528
        overtone.frequency.value = 1056.6
        overtone.detune.value = -8
        fundamental.connect(bellGain)
        overtone.connect(bellGain)
        bellGain.connect(masterGain)
        fundamental.start(now)
        overtone.start(now + 0.01)
        fundamental.stop(now + 5)
        overtone.stop(now + 5)
      }

      playBell()
      const bellTimer = window.setInterval(playBell, 15000)
      audioRef.current = { ...audioRef.current, context, gain: masterGain, nodes, bellTimer }
    } catch {
      audioRef.current = { ...audioRef.current, context: null, gain: null, nodes: [], bellTimer: null }
    }
  }

  function stopAudio() {
    const { context, gain, nodes, bellTimer, background } = audioRef.current

    if (background) {
      background.pause()
      background.currentTime = 0
    }

    if (!context || !gain || !nodes?.length) return

    if (bellTimer) window.clearInterval(bellTimer)

    const now = context.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2)

    window.setTimeout(() => {
      nodes.forEach((node) => {
        try {
          node.stop()
        } catch {}
      })
      audioRef.current = { ...audioRef.current, context, gain: null, nodes: [], bellTimer: null }
    }, 2100)
  }

  return { startAudio, stopAudio }
}
