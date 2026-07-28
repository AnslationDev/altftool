const seo = {
  title: "Rock Paper Scissors Game Online — Play vs Computer",
  h1: "Rock Paper Scissors Online",
  metaDescription:
    "Play Rock Paper Scissors free against the computer — 3-2-1 countdown reveal, win rate and streak tracking saved locally, plus a 3D coin flip.",
  intro:
    "Rock Paper Scissors puts you against a computer opponent that picks its move with a single uniform Math.random() draw across the three options — the draw never takes your choice as input, so there is no pattern-reading AI to outsmart and no way for it to cheat. Each round is scored against a fixed beats table (rock beats scissors, paper beats rock, scissors beats paper) after a 3-2-1 countdown, and your wins, losses, draws, win rate and streaks are written to your browser's localStorage rather than to a server. The same hub also contains Flip Coin, a CSS 3D coin that spins on a rotateY transform to land on a pre-drawn 50/50 result and keeps a log of your last 30 flips. Everything runs client-side in the page — no account, no upload, no network call for gameplay.",
  useCases: [
    "Settling a quick yes/no or one-of-three decision on your own when there is no physical coin or second player around",
    "Playing a few fast rounds between tasks with a scoreboard that survives a page refresh instead of resetting to zero",
    "Demonstrating randomness in a probability lesson — run auto-flip on the coin and watch heads and tails converge toward an even split as the sample grows",
  ],
  benefits: [
    [
      "An opponent that genuinely can't cheat",
      "The computer's move is a uniform random pick from rock, paper and scissors, drawn independently of what you selected. There's no history tracking and no adaptive model, so every round is a clean 1-in-3.",
    ],
    [
      "Your record is kept on your device",
      "Wins, losses, draws, win rate, current streak and best streak are saved to localStorage in your own browser. They persist across refreshes and closed tabs, never reach a server, and clear instantly with the Reset stats button.",
    ],
    [
      "Sound with nothing to download",
      "Every tone is synthesised live with Web Audio oscillators — the win fanfare is a five-note arpeggio from 523 Hz to 1318 Hz — so there are no audio files to load, and the mute toggle is remembered between visits.",
    ],
    [
      "Two games in one hub",
      "Alongside Rock Paper Scissors, the 3D Flip Coin lets you call heads or tails before the spin, tracks how often your prediction lands, offers three coin designs, auto-flips every 1.2 seconds and keeps a timestamped history of the last 30 results.",
    ],
  ],
  faqs: [
    [
      "How do you play rock paper scissors against the computer?",
      "Tap Rock, Paper or Scissors, and the computer's move is drawn at that same instant. A 3-2-1 countdown runs at 650 ms per beat, both hands reveal after about 2.6 seconds, and the round is scored: rock beats scissors, paper beats rock, scissors beats paper, and identical picks are a draw.",
    ],
    [
      "Is the computer's move actually random, or does it cheat?",
      "It's random. Each round the tool calls Math.random() to pick one of the three moves with equal probability, and that call doesn't receive your choice as an input — it can't see what you played, and it doesn't store or analyse your past moves.",
    ],
    [
      "Can you beat the computer at rock paper scissors?",
      "You can win individual rounds, but no strategy improves your odds here. Against a uniform random opponent every move has the same expectation, so over many rounds your results tend toward roughly one third wins, one third losses and one third draws. Pattern-based tactics only work against human opponents who have habits.",
    ],
    [
      "Does this rock paper scissors game save my score?",
      "Yes — wins, losses, draws, win rate, current streak and best streak are stored in your browser's localStorage, so they're still there after a refresh or after closing the tab. They're tied to that one browser on that one device, they're never sent anywhere, and Reset stats wipes them. A private or incognito window discards them when you close it.",
    ],
    [
      "Is the coin flip really 50/50?",
      "Yes. The face is chosen by a single Math.random() < 0.5 test, which is an even split between heads and tails, and the 3D animation is then rotated to land on that already-decided result. It uses the JavaScript engine's standard pseudo-random generator, not a cryptographic one, so it's fine for games and casual decisions but not for anything that needs auditable or provably fair randomness.",
    ],
    [
      "Why did my winning streak reset after a draw?",
      "Because the streak counter only survives a win. A loss resets it to zero, and so does a draw — only consecutive wins build it up. Best streak keeps the highest run you've reached, and win rate is wins divided by all rounds played, rounded to a whole percent.",
    ],
    [
      "Do I need an account or a download to play?",
      "No. Both games are free, need no signup and install nothing — the whole hub runs as client-side JavaScript in the page you already have open, including the sound, which is generated by the browser rather than streamed from files.",
    ],
    [
      "Can I turn the sound off?",
      "Yes, the speaker button in the header mutes and unmutes, and your choice is saved in localStorage for next time. Note that browsers block audio until you interact with the page, so the first tone plays on your first tap — the tool resumes the AudioContext at that moment.",
    ],
  ],
  steps: [
    "Open the Game Hub and pick Rock Paper Scissors — or choose Flip Coin for a straight 50/50 call.",
    "Tap Rock, Paper or Scissors. The computer's move is drawn at the same moment, then a 3-2-1 countdown reveals both hands.",
    "Read the result along with your running win rate and streak, then hit Play again for another round or Reset stats to clear your record.",
  ],
};

export default seo;
