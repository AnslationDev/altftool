export const meditationMessages = [
  [0, 'Look at your thought...'],
  [8, 'Now look at the universe around it...'],
  [16, 'Your thought is just one of billions of things in this universe...'],
  [24, "It's small."],
  [32, 'You are bigger than your thoughts.'],
  [40, 'Let it go...'],
  [52, '...'],
  [58, 'How do you feel?'],
]

function createSeededRandom(seed) {
  let value = seed

  return function seededRandom() {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function randomBetween(random, min, max) {
  return random() * (max - min) + min
}

export function makeStars() {
  const random = createSeededRandom(43260)

  return Array.from({ length: 260 }, (_, index) => ({
    id: index,
    left: `${randomBetween(random, 0, 100).toFixed(3)}%`,
    top: `${randomBetween(random, 0, 100).toFixed(3)}%`,
    size: `${randomBetween(random, 1, 3.2).toFixed(2)}px`,
    opacity: randomBetween(random, 0.35, 1).toFixed(2),
    speed: `${randomBetween(random, 2.4, 7.5).toFixed(2)}s`,
    driftX: `${randomBetween(random, -90, 90).toFixed(2)}px`,
    driftY: `${randomBetween(random, -70, 70).toFixed(2)}px`,
    driftSpeed: `${randomBetween(random, 28, 58).toFixed(2)}s`,
    delay: `${randomBetween(random, -8, 0).toFixed(2)}s`,
  }))
}

export function makeParticles(count, burst = false, seed = burst ? 58920 : 21634) {
  const random = createSeededRandom(seed)

  return Array.from({ length: count }, (_, index) => ({
    id: index,
    angle: `${randomBetween(random, 0, 360).toFixed(2)}deg`,
    size: `${randomBetween(random, burst ? 1.2 : 1, burst ? 3.8 : 3.5).toFixed(2)}px`,
    speed: `${randomBetween(random, 4.5, 9).toFixed(2)}s`,
    delay: `${randomBetween(random, burst ? 0 : -4, burst ? 0.42 : 1).toFixed(2)}s`,
    distance: `${randomBetween(random, 28, 118).toFixed(2)}px`,
  }))
}
