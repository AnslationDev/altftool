const seo = {
  title: "ETH Gas Now: Live Gwei from an Ethereum Node",
  metaDescription:
    "Reads eth_gasPrice live from the Cloudflare Ethereum Gateway, shows slow/normal/fast tiers at 0.9x/1x/1.2x and prices a 21,000-gas ETH transfer.",
  steps: [
    "No query is needed — the checker calls eth_gasPrice on the Cloudflare Ethereum Gateway over JSON-RPC and converts the wei response to gwei.",
    "Press \"Get current result\" to fetch the reading on demand.",
    "Read the current gwei price with Slow, Normal and Fast estimates at 0.9x, 1.0x and 1.2x, the \"21,000 gas transfer\" fee in ETH, and the update timestamp with the source named.",
  ],
  intro:
    "This gas checker reads the current Ethereum gas price straight from an eth_gasPrice JSON-RPC call to the Cloudflare Ethereum Gateway, converts the wei value to gwei, and shows three tiers built from stated multipliers — slow at 0.9×, normal at 1.0× and fast at 1.2× the returned price. It also prices a plain 21,000-gas ETH transfer at each level so you can see the fee in ETH rather than in gwei. It is for anyone deciding whether to send a transaction now or wait for the network to quieten down.",
  useCases: [
    "Deciding whether to send an ETH transfer this minute or in an hour, by seeing what a 21,000-gas transaction costs at the current price",
    "Sanity-checking the gas fee your wallet has pre-filled before you approve a transaction",
    "Watching gas during a busy mint or airdrop window to judge when the price has come back down",
  ],
  benefits: [
    ["The number comes from a node, not a scraper", "The reading is a live eth_gasPrice JSON-RPC response from the Cloudflare Ethereum Gateway, with the source named on screen."],
    ["The tiers are arithmetic you can check", "Slow, normal and fast are 0.9×, 1.0× and 1.2× of that single reading — no hidden model, no proprietary estimate."],
    ["Fee shown in ETH, not just gwei", "A 21,000-gas transfer is priced out for you, which is the number that actually leaves your wallet."],
  ],
  faqs: [
    [
      "What is gwei?",
      "Gwei is a billionth of an ETH — 1 gwei = 0.000000001 ETH, or 10⁹ wei. Gas prices are quoted in gwei because raw wei figures are unwieldy; this tool converts the node's wei response by dividing by 1e9.",
    ],
    [
      "How much gas does a simple ETH transfer use?",
      "Exactly 21,000 gas — that is the protocol's fixed cost for a basic transfer with no contract call. Multiply 21,000 by the gas price in gwei and divide by 1e9 to get the fee in ETH, which is the calculation shown in the last row here. Contract interactions such as token transfers or swaps use considerably more.",
    ],
    [
      "Do the slow, normal and fast tiers guarantee inclusion?",
      "No. They are fixed multipliers of 0.9, 1.0 and 1.2 applied to one gas-price reading, not predictions of how long a block will take to include you. Actual inclusion depends on the base fee and priority fee at the moment your transaction is broadcast, so treat the tiers as a rough guide.",
    ],
    [
      "Why does gas fluctuate so much?",
      "Because EIP-1559 adjusts the base fee up or down each block depending on how full the previous block was — up to about 12.5% per block. Sustained demand from mints, liquidations or heavy DeFi activity pushes the base fee up quickly, and it falls just as fast once blocks stop filling.",
    ],
  ],
};

export default seo;
