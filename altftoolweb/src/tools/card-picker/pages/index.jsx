"use client";

// index.jsx
import React, { useState } from "react";
import "../CardPicker.css";const suits = [
  { name: "Hearts", symbol: "♥", color: "red" },
  { name: "Diamonds", symbol: "♦", color: "red" },
  { name: "Clubs", symbol: "♣", color: "black" },
  { name: "Spades", symbol: "♠", color: "black" }
];

const ranks = [
  "Ace",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "Jack",
  "Queen",
  "King"
];

function App() {
  const [card, setCard] = useState(null); // { rank, suit }
  const [isPicking, setIsPicking] = useState(false);
  const [flipped, setFlipped] = useState(false); // false => show back, true => show front

  const pickCard = () => {
    if (isPicking) return;
    setIsPicking(true);

    // ensure we show back first
    setFlipped(false);

    // small pause so user sees the "back" before flip
    setTimeout(() => {
      const randomSuit = suits[Math.floor(Math.random() * suits.length)];
      const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
      setCard({ rank: randomRank, suit: randomSuit });
      // flip to reveal after value assigned
      setFlipped(true);

      // finish picking animation state
      setTimeout(() => {
        setIsPicking(false);
      }, 600);
    }, 450);
  };

  const renderRankShort = (rank) => {
    if (!rank) return "";
    if (rank === "Ace") return "A";
    if (rank === "Jack") return "J";
    if (rank === "Queen") return "Q";
    if (rank === "King") return "K";
    return rank; // 2-10
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) font-sans">
      <main className="card-picker-container">
        <div className="card-stage">
          <div
            className={`card ${flipped ? "flipped" : ""}`}
            aria-hidden={isPicking}
          >
            <div className="card-inner">
              {/* FRONT */}
              <div className="card-face card-front">
                {card ? (
                  <>
                    <div className="corner top-left">
                      <span className="rank">{renderRankShort(card.rank)}</span>
                      <span
                        className="suit small"
                        style={{ color: card.suit.color }}
                      >
                        {card.suit.symbol}
                      </span>
                    </div>

                    <div
                      className="center-suit"
                      style={{ color: card.suit.color }}
                    >
                      <div className="suit-large">{card.suit.symbol}</div>
                      <div className="rank-word">{card.rank}</div>
                    </div>

                    <div className="corner bottom-right">
                      <span className="rank">{renderRankShort(card.rank)}</span>
                      <span
                        className="suit small"
                        style={{ color: card.suit.color }}
                      >
                        {card.suit.symbol}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="placeholder-front">
                    <div className="placeholder-text">Ready to Pick</div>
                  </div>
                )}
              </div>

              {/* BACK */}
              <div className="card-face card-back" aria-hidden={flipped}>
                {/* prefer image back if available, otherwise show CSS fallback */}
                <div className="back-graphic" />
              </div>
            </div>
          </div>
        </div>

        <div className="controls">
          <button className="pick-btn" onClick={pickCard} disabled={isPicking}>
            {isPicking ? "Picking..." : "Pick Card"}
          </button>

          <div className="picked-info" aria-live="polite">
            {card ? (
              <div className="picked-row">
                <div className="picked-preview">
                  <div className="mini-card">
                    <div className="mini-top">
                      <span className="mini-rank">
                        {renderRankShort(card.rank)}
                      </span>
                      <span
                        className="mini-suit"
                        style={{ color: card.suit.color }}
                      >
                        {card.suit.symbol}
                      </span>
                    </div>
                    <div
                      className="mini-center"
                      style={{ color: card.suit.color }}
                    >
                      {card.suit.symbol}
                    </div>
                    <div className="mini-bottom">
                      <span className="mini-rank">
                        {renderRankShort(card.rank)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="picked-text">
                  <strong>
                    {card.rank} of {card.suit.name}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="picked-placeholder">No card picked yet</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
