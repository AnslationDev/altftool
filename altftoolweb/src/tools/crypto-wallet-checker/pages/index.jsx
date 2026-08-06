"use client";

import { useState, useCallback } from "react";

// ── Wallet format validators ──────────────────────────────────────────────────
const CHAINS = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    color: "#F7931A",
    icon: "₿",
    formats: [
      {
        label: "Legacy (P2PKH)",
        prefix: "1",
        regex: /^1[1-9A-HJ-NP-Za-km-z]{25,34}$/,
        desc: "Starts with 1",
      },
      {
        label: "Script (P2SH)",
        prefix: "3",
        regex: /^3[1-9A-HJ-NP-Za-km-z]{25,34}$/,
        desc: "Starts with 3",
      },
      {
        label: "SegWit (Bech32)",
        prefix: "bc1q",
        regex: /^bc1q[0-9a-z]{38,59}$/,
        desc: "Starts with bc1q",
      },
      {
        label: "Taproot (Bech32m)",
        prefix: "bc1p",
        regex: /^bc1p[0-9a-z]{58}$/,
        desc: "Starts with bc1p",
      },
    ],
    validate(addr) {
      for (const f of this.formats) {
        if (f.regex.test(addr)) return { valid: true, format: f.label, desc: f.desc };
      }
      return { valid: false };
    },
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    color: "#627EEA",
    icon: "Ξ",
    formats: [
      {
        label: "EIP-55 Checksum",
        regex: /^0x[0-9a-fA-F]{40}$/,
        desc: "0x + 40 hex chars",
      },
    ],
    validate(addr) {
      if (/^0x[0-9a-fA-F]{40}$/.test(addr)) {
        const isChecksummed = addr !== addr.toLowerCase() && addr !== addr.toUpperCase();
        return {
          valid: true,
          format: isChecksummed ? "EIP-55 Checksum" : "Lowercase Hex",
          desc: "0x + 40 hex characters",
        };
      }
      return { valid: false };
    },
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    color: "#9945FF",
    icon: "◎",
    formats: [
      { label: "Base58", regex: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/, desc: "32-44 Base58 chars" },
    ],
    validate(addr) {
      if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)) {
        return { valid: true, format: "Base58", desc: "32-44 Base58 characters" };
      }
      return { valid: false };
    },
  },
  {
    id: "litecoin",
    name: "Litecoin",
    symbol: "LTC",
    color: "#BFBBBB",
    icon: "Ł",
    formats: [
      { label: "Legacy", regex: /^L[a-km-zA-HJ-NP-Z1-9]{26,33}$/, desc: "Starts with L" },
      { label: "Script", regex: /^M[a-km-zA-HJ-NP-Z1-9]{26,33}$/, desc: "Starts with M" },
      { label: "Bech32", regex: /^ltc1[qp][0-9a-z]{38,59}$/, desc: "Starts with ltc1" },
    ],
    validate(addr) {
      for (const f of this.formats) {
        if (f.regex.test(addr)) return { valid: true, format: f.label, desc: f.desc };
      }
      return { valid: false };
    },
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    symbol: "DOGE",
    color: "#C2A633",
    icon: "Ð",
    formats: [
      { label: "Standard", regex: /^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/, desc: "Starts with D" },
    ],
    validate(addr) {
      if (/^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/.test(addr)) {
        return { valid: true, format: "Standard", desc: "Starts with D, 34 chars" };
      }
      return { valid: false };
    },
  },
  {
    id: "ripple",
    name: "XRP / Ripple",
    symbol: "XRP",
    color: "#00AAE4",
    icon: "✕",
    formats: [
      { label: "Classic", regex: /^r[0-9a-zA-Z]{24,34}$/, desc: "Starts with r" },
    ],
    validate(addr) {
      if (/^r[0-9a-zA-Z]{24,34}$/.test(addr)) {
        return { valid: true, format: "Classic Address", desc: "Starts with r" };
      }
      return { valid: false };
    },
  },
  {
    id: "tron",
    name: "TRON",
    symbol: "TRX",
    color: "#FF0013",
    icon: "Ŧ",
    formats: [
      { label: "Base58Check", regex: /^T[a-zA-Z0-9]{33}$/, desc: "Starts with T, 34 chars" },
    ],
    validate(addr) {
      if (/^T[a-zA-Z0-9]{33}$/.test(addr)) {
        return { valid: true, format: "Base58Check", desc: "Starts with T, 34 characters" };
      }
      return { valid: false };
    },
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    color: "#0D1E7A",
    icon: "₳",
    formats: [
      { label: "Shelley (Bech32)", regex: /^addr1[0-9a-z]{50,100}$/, desc: "Starts with addr1" },
      { label: "Byron (Base58)", regex: /^Ae2[1-9A-HJ-NP-Za-km-z]{50,}$/, desc: "Starts with Ae2" },
    ],
    validate(addr) {
      for (const f of this.formats) {
        if (f.regex.test(addr)) return { valid: true, format: f.label, desc: f.desc };
      }
      return { valid: false };
    },
  },
  {
    id: "polkadot",
    name: "Polkadot",
    symbol: "DOT",
    color: "#E6007A",
    icon: "●",
    formats: [
      { label: "SS58", regex: /^1[1-9A-HJ-NP-Za-km-z]{46,47}$/, desc: "Starts with 1, SS58 format" },
    ],
    validate(addr) {
      if (/^1[1-9A-HJ-NP-Za-km-z]{46,47}$/.test(addr)) {
        return { valid: true, format: "SS58", desc: "Polkadot SS58 encoding" };
      }
      return { valid: false };
    },
  },
  {
    id: "bnb",
    name: "BNB Smart Chain",
    symbol: "BNB",
    color: "#F3BA2F",
    icon: "⬡",
    formats: [
      { label: "EVM (same as ETH)", regex: /^0x[0-9a-fA-F]{40}$/, desc: "EVM-compatible, 0x + 40 hex" },
    ],
    validate(addr) {
      if (/^0x[0-9a-fA-F]{40}$/.test(addr)) {
        return { valid: true, format: "EVM Address", desc: "Compatible with ETH format" };
      }
      return { valid: false };
    },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function detectAll(address) {
  const trimmed = address.trim();
  if (!trimmed) return [];
  return CHAINS.filter((c) => c.validate(trimmed).valid).map((c) => ({
    chain: c,
    result: c.validate(trimmed),
  }));
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Badge({ color, children }) {
  return (
    <span
      style={{
        background: color + "22",
        color,
        border: `1px solid ${color}55`,
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        fontFamily: "monospace",
      }}
    >
      {children}
    </span>
  );
}

function MatchCard({ chain, result, address }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      style={{
        background: "#0d1117",
        border: `1.5px solid ${chain.color}55`,
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        transition: "border-color 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* glow strip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: chain.color,
          borderRadius: "12px 0 0 12px",
        }}
      />
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: chain.color + "22",
          border: `2px solid ${chain.color}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          color: chain.color,
          flexShrink: 0,
        }}
      >
        {chain.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ color: "#f0f6fc", fontWeight: 700, fontSize: 15, fontFamily: "'Syne', sans-serif" }}>
            {chain.name}
          </span>
          <Badge color={chain.color}>{chain.symbol}</Badge>
          <Badge color="#58a6ff">{result.format}</Badge>
        </div>
        <div style={{ color: "#8b949e", fontSize: 12, marginTop: 4 }}>{result.desc}</div>
      </div>
      <button
        onClick={handleCopy}
        title="Copy address"
        style={{
          background: copied ? "#238636" : "#1c2128",
          border: "1px solid #30363d",
          borderRadius: 6,
          color: copied ? "#fff" : "#8b949e",
          padding: "6px 12px",
          fontSize: 12,
          cursor: "pointer",
          transition: "all 0.2s",
          flexShrink: 0,
          fontFamily: "monospace",
        }}
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );
}

function FormatRef() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {CHAINS.map((c) => (
        <div
          key={c.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            background: "#0d1117",
            borderRadius: 8,
            border: "1px solid #21262d",
          }}
        >
          <span style={{ color: c.color, width: 22, textAlign: "center", fontSize: 17 }}>{c.icon}</span>
          <span style={{ color: "#f0f6fc", fontSize: 13, fontWeight: 600, width: 130, flexShrink: 0 }}>
            {c.name}
          </span>
          <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {c.formats.map((f) => (
              <span
                key={f.label}
                style={{
                  background: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: 4,
                  color: "#8b949e",
                  fontSize: 11,
                  padding: "2px 7px",
                  fontFamily: "monospace",
                }}
              >
                {f.desc}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryPanel({ history, onSelect, onClear }) {
  if (history.length === 0)
    return <p style={{ color: "#484f58", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No history yet.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {history.map((item, i) => (
        <div
          key={i}
          onClick={() => onSelect(item.address)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            background: "#0d1117",
            border: "1px solid #21262d",
            borderRadius: 8,
            cursor: "pointer",
            transition: "border-color 0.15s",
          }}
        >
          <span style={{ fontSize: 12, color: item.matches.length ? "#3fb950" : "#f85149", flexShrink: 0 }}>
            {item.matches.length ? "✓" : "✗"}
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "#8b949e",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {item.address}
          </span>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            {item.matches.slice(0, 3).map((m) => (
              <span key={m.chain.id} style={{ color: m.chain.color, fontSize: 13 }}>
                {m.chain.icon}
              </span>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={onClear}
        style={{
          background: "transparent",
          border: "1px solid #f8514933",
          borderRadius: 6,
          color: "#f85149",
          padding: "6px",
          fontSize: 12,
          cursor: "pointer",
          marginTop: 4,
        }}
      >
        Clear History
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CryptoWalletChecker() {
  const [address, setAddress] = useState("");
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("checker"); // checker | formats | history
  const [history, setHistory] = useState([]);
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState(null);

  const check = useCallback(
    (addr) => {
      const a = (addr ?? address).trim();
      if (!a) return;
      setLoading(true);
      setTimeout(() => {
        const found = detectAll(a);
        setMatches(found);
        setLoading(false);
        setHistory((h) => {
          const filtered = h.filter((x) => x.address !== a);
          return [{ address: a, matches: found }, ...filtered].slice(0, 30);
        });
      }, 300);
    },
    [address]
  );

  const handleBatch = () => {
    const lines = batchInput
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter(Boolean);
    setBatchResults(
      lines.map((addr) => ({
        address: addr,
        matches: detectAll(addr),
      }))
    );
  };

  const lengthInfo =
    address.trim().length > 0
      ? `${address.trim().length} chars`
      : null;

  const tabStyle = (id) => ({
    padding: "8px 20px",
    borderRadius: 8,
    border: "none",
    background: tab === id ? "#1f6feb" : "transparent",
    color: tab === id ? "#fff" : "#8b949e",
    fontWeight: tab === id ? 700 : 500,
    cursor: "pointer",
    fontSize: 13,
    transition: "all 0.15s",
    fontFamily: "'Syne', sans-serif",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #010409; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
        textarea:focus, input:focus { outline: none; }
        @keyframes pulse-ring {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.4); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .match-card { animation: slide-in 0.25s ease both; }
        .match-card:nth-child(1) { animation-delay: 0.00s; }
        .match-card:nth-child(2) { animation-delay: 0.05s; }
        .match-card:nth-child(3) { animation-delay: 0.10s; }
        .match-card:nth-child(4) { animation-delay: 0.15s; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#010409",
          color: "#c9d1d9",
          fontFamily: "'Syne', sans-serif",
          padding: "0 0 60px",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            background: "linear-gradient(180deg, #0d1117 0%, #010409 100%)",
            borderBottom: "1px solid #21262d",
            padding: "32px 24px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #1f6feb, #388bfd)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                position: "relative",
              }}
            >
              🔍
              <div
                style={{
                  position: "absolute",
                  inset: -4,
                  borderRadius: 16,
                  border: "2px solid #388bfd",
                  animation: "pulse-ring 2s infinite",
                }}
              />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#f0f6fc",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                Crypto Wallet Checker
              </h1>
              <p style={{ color: "#484f58", fontSize: 13, marginTop: 4 }}>
                Validate & identify wallet addresses across 10 blockchains
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Chains", value: CHAINS.length },
              { label: "Formats", value: CHAINS.reduce((a, c) => a + c.formats.length, 0) },
              { label: "Checked", value: history.length },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ color: "#388bfd", fontWeight: 800, fontSize: 20 }}>{s.value}</div>
                <div style={{ color: "#484f58", fontSize: 11, letterSpacing: "0.08em" }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 16px" }}>
          {/* ── Tabs ── */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginTop: 24,
              background: "#0d1117",
              borderRadius: 10,
              padding: 4,
              border: "1px solid #21262d",
            }}
          >
            {[
              { id: "checker", label: "🔍 Checker" },
              { id: "batch", label: "📋 Batch" },
              { id: "formats", label: "📖 Formats" },
              { id: "history", label: `🕐 History (${history.length})` },
            ].map((t) => (
              <button key={t.id} style={tabStyle(t.id)} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Checker Tab ── */}
          {tab === "checker" && (
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  background: "#0d1117",
                  border: "1.5px solid #21262d",
                  borderRadius: 12,
                  padding: 20,
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ position: "relative" }}>
                  <textarea
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setMatches(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        check();
                      }
                    }}
                    placeholder="Paste any crypto wallet address here…"
                    rows={3}
                    style={{
                      width: "100%",
                      background: "#161b22",
                      border: "1px solid #30363d",
                      borderRadius: 8,
                      color: "#f0f6fc",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                      padding: "12px 14px",
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                  />
                  {lengthInfo && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 10,
                        color: "#484f58",
                        fontSize: 11,
                        fontFamily: "monospace",
                      }}
                    >
                      {lengthInfo}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button
                    onClick={() => check()}
                    disabled={!address.trim() || loading}
                    style={{
                      flex: 1,
                      background: address.trim() && !loading ? "linear-gradient(135deg,#1f6feb,#388bfd)" : "#21262d",
                      border: "none",
                      borderRadius: 8,
                      color: address.trim() && !loading ? "#fff" : "#484f58",
                      padding: "11px",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: address.trim() && !loading ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    {loading ? "Checking…" : "Check Address"}
                  </button>
                  <button
                    onClick={() => {
                      setAddress("");
                      setMatches(null);
                    }}
                    style={{
                      background: "#161b22",
                      border: "1px solid #30363d",
                      borderRadius: 8,
                      color: "#8b949e",
                      padding: "11px 16px",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    Clear
                  </button>
                  <button
                    onClick={async () => {
                      const text = await navigator.clipboard?.readText().catch(() => "");
                      if (text) { setAddress(text); setMatches(null); }
                    }}
                    style={{
                      background: "#161b22",
                      border: "1px solid #30363d",
                      borderRadius: 8,
                      color: "#8b949e",
                      padding: "11px 16px",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                    title="Paste from clipboard"
                  >
                    📋
                  </button>
                </div>
              </div>

              {/* Results */}
              {matches !== null && (
                <div style={{ marginTop: 20 }}>
                  {matches.length === 0 ? (
                    <div
                      style={{
                        background: "#0d1117",
                        border: "1.5px solid #f8514933",
                        borderRadius: 12,
                        padding: 24,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 8 }}>❌</div>
                      <div style={{ color: "#f85149", fontWeight: 700, fontSize: 16 }}>
                        No matching format found
                      </div>
                      <div style={{ color: "#8b949e", fontSize: 13, marginTop: 6 }}>
                        This address doesn't match any supported blockchain format.
                        Check for typos or unsupported chain.
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#3fb950",
                          }}
                        />
                        <span style={{ color: "#3fb950", fontWeight: 700, fontSize: 14 }}>
                          {matches.length} matching chain{matches.length > 1 ? "s" : ""} found
                        </span>
                        {matches.length > 1 && (
                          <span style={{ color: "#8b949e", fontSize: 12 }}>
                            — Address is valid across multiple networks
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {matches.map((m, i) => (
                          <div key={m.chain.id} className="match-card">
                            <MatchCard chain={m.chain} result={m.result} address={address.trim()} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Quick examples */}
              {matches === null && !address && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ color: "#484f58", fontSize: 12, marginBottom: 10, letterSpacing: "0.06em" }}>
                    TRY AN EXAMPLE
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {[
                      { label: "BTC Legacy", addr: "1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf6R" },
                      { label: "ETH", addr: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe" },
                      { label: "SOL", addr: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM" },
                      { label: "BTC SegWit", addr: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq" },
                    ].map((ex) => (
                      <button
                        key={ex.label}
                        onClick={() => { setAddress(ex.addr); setMatches(null); }}
                        style={{
                          background: "#161b22",
                          border: "1px solid #30363d",
                          borderRadius: 6,
                          color: "#8b949e",
                          padding: "6px 12px",
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "monospace",
                          transition: "border-color 0.15s",
                        }}
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Batch Tab ── */}
          {tab === "batch" && (
            <div style={{ marginTop: 20 }}>
              <p style={{ color: "#8b949e", fontSize: 13, marginBottom: 12 }}>
                Enter multiple addresses separated by commas or new lines.
              </p>
              <textarea
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder={"1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf6R\n0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe\n..."}
                rows={6}
                style={{
                  width: "100%",
                  background: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: 8,
                  color: "#f0f6fc",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  padding: "12px 14px",
                  resize: "vertical",
                }}
              />
              <button
                onClick={handleBatch}
                disabled={!batchInput.trim()}
                style={{
                  marginTop: 10,
                  background: batchInput.trim() ? "linear-gradient(135deg,#1f6feb,#388bfd)" : "#21262d",
                  border: "none",
                  borderRadius: 8,
                  color: batchInput.trim() ? "#fff" : "#484f58",
                  padding: "10px 24px",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: batchInput.trim() ? "pointer" : "not-allowed",
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                Check All
              </button>

              {batchResults && (
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* summary */}
                  <div style={{ display: "flex", gap: 16, marginBottom: 6 }}>
                    <span style={{ color: "#3fb950", fontSize: 13 }}>
                      ✓ {batchResults.filter(r => r.matches.length > 0).length} valid
                    </span>
                    <span style={{ color: "#f85149", fontSize: 13 }}>
                      ✗ {batchResults.filter(r => r.matches.length === 0).length} invalid
                    </span>
                  </div>
                  {batchResults.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#0d1117",
                        border: `1px solid ${r.matches.length ? "#238636" : "#da363333"}`,
                        borderRadius: 8,
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 12, color: r.matches.length ? "#3fb950" : "#f85149", flexShrink: 0 }}>
                        {r.matches.length ? "✓" : "✗"}
                      </span>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          color: "#8b949e",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.address}
                      </span>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        {r.matches.map((m) => (
                          <span
                            key={m.chain.id}
                            title={m.chain.name}
                            style={{ color: m.chain.color, fontSize: 14 }}
                          >
                            {m.chain.icon}
                          </span>
                        ))}
                        {r.matches.length === 0 && (
                          <span style={{ color: "#484f58", fontSize: 11 }}>Unknown</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Formats Tab ── */}
          {tab === "formats" && (
            <div style={{ marginTop: 20 }}>
              <p style={{ color: "#8b949e", fontSize: 13, marginBottom: 16 }}>
                Supported blockchain address formats and their patterns.
              </p>
              <FormatRef />
            </div>
          )}

          {/* ── History Tab ── */}
          {tab === "history" && (
            <div style={{ marginTop: 20 }}>
              <HistoryPanel
                history={history}
                onSelect={(addr) => { setAddress(addr); setMatches(null); setTab("checker"); }}
                onClear={() => setHistory([])}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 48, color: "#484f58", fontSize: 12 }}>
          Crypto Wallet Format Checker · Supports {CHAINS.length} blockchains · Local validation only
        </div>
      </div>
    </>
  );
}
