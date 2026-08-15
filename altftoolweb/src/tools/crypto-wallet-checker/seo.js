const seo = {
  title: "Crypto Wallet Address Validator for 10 Blockchains",
  metaDescription:
    "Check an address against 10 chains' formats and see which it matches - Taproot bc1p, SegWit bc1q, P2SH, or a 40-hex 0x address. No chain lookup.",
  intro:
    "Crypto Wallet Checker tests a wallet address against the address-format rules of ten blockchains — Bitcoin, Ethereum, Solana, Litecoin, Dogecoin, XRP, TRON, Cardano, Polkadot and BNB Smart Chain — and reports every chain and address type it validly matches. It is for anyone about to send funds who wants to confirm an address is well-formed and belongs to the network they think it does. Results name the specific format, such as Taproot (bc1p), SegWit (bc1q), P2SH (starts with 3), or an EVM 0x address with 40 hex characters.",
  useCases: [
    "Someone sends you a payout address starting with 0x and you want to confirm whether it is an Ethereum or BNB Smart Chain address before you pick the network in your wallet.",
    "You are checking a bc1p address a client pasted into an invoice and need to know it is a valid Taproot address rather than a truncated SegWit one.",
    "You have a column of 40 addresses exported from a spreadsheet and want to paste them all in at once to spot which lines are malformed before running a batch payout.",
  ],
  benefits: [
    [
      "Tells you the format, not just pass or fail",
      "A Bitcoin address is reported as Legacy P2PKH, P2SH, SegWit Bech32 or Taproot Bech32m, so you can tell exactly which address type you are dealing with.",
    ],
    [
      "Shows every chain an address matches",
      "Formats overlap across networks — a 0x address is valid on both Ethereum and BNB Smart Chain — and all matching chains are listed instead of only the first guess.",
    ],
    [
      "Batch mode plus a running history",
      "Paste many addresses separated by newlines or commas to check them in one pass, and the last 30 checks stay listed so you can re-open any of them.",
    ],
  ],
  faqs: [
    [
      "Which blockchains does it check?",
      "Ten: Bitcoin, Ethereum, Solana, Litecoin, Dogecoin, XRP, TRON, Cardano, Polkadot and BNB Smart Chain. Bitcoin, Litecoin and Cardano each have several recognised address types, so a single address can match a specific format within a chain.",
    ],
    [
      "Does a valid result mean the wallet exists and holds funds?",
      "No. The check is purely a format check against each chain's address pattern — it never queries a blockchain, so it cannot tell you whether an address has ever been used, holds a balance, or belongs to the person who sent it to you.",
    ],
    [
      "Why does one address match both Ethereum and BNB Smart Chain?",
      "BNB Smart Chain is EVM-compatible and uses the identical address shape: `0x` followed by 40 hexadecimal characters. Format alone cannot separate the two, so you must confirm the intended network with whoever gave you the address.",
    ],
    [
      "Is the EIP-55 checksum verified?",
      "Not cryptographically. A 0x address containing a mix of upper and lower case is labelled as checksummed and an all-lowercase one as plain hex, but the tool does not recompute the EIP-55 hash, so a mistyped character inside a mixed-case address can still pass.",
    ],
  ],
};

export default seo;
