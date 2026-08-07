const seo = {
  intro:
    "This planner turns a child's age, Minecraft edition and play style into the specific list of Xbox privacy, Realm, chat and spending settings that apply to them, and scores how much of that list is done. Minecraft itself has few safety controls — most of the protection lives in the Microsoft account it signs into, so the checklist covers both the game menus and account.xbox.com. Built for parents who want the menu paths rather than general advice.",
  useCases: [
    "Setting up Minecraft Bedrock on a new console or tablet for an 8-year-old who will only play on a family Realm.",
    "Working out why a child cannot see the Featured Servers tab, or deliberately removing it through Xbox privacy settings.",
    "Reviewing an existing teen setup after they ask to join a public community server with open chat.",
    "Handing the finished checklist to the other parent or a grandparent so the same settings are applied on the second device.",
  ],
  benefits: [
    ["Menu paths, not advice", "Every step names the exact screen — Xbox privacy, Realm members, or Minecraft settings — where the switch lives."],
    // Figure below is hand-verified against lib.js STEPS for edition:"bedrock", playMode:"solo",
    // childAge:10 (the app's own defaults) = 10 steps (5 essential + 3 recommended + 2 optional).
    // seo.js is loaded standalone at build time and must NOT import ./lib — re-check this figure
    // by hand (or via `node --input-type=module -e "import{buildPlan}from './lib.js'; ..."`)
    // whenever STEPS in lib.js changes.
    ["Scoped to how they play", "A solo Bedrock player gets a 10-step list; a public-server player gets server vetting and voice-chat planning added."],
    ["Weighted score", "Essential steps count more than nice-to-haves, so the percentage reflects real exposure rather than boxes ticked."],
  ],
  faqs: [
    [
      "How do I stop strangers talking to my child in Minecraft?",
      "Most of it is done outside the game: at account.xbox.com go to Privacy & online safety > Xbox privacy and set 'Others can communicate with voice, text, or invites' to Friends, and 'You can play with people outside of Xbox network' to Block. Inside the game, set Java chat to Hidden or Commands-only under Options > Chat Settings, or turn on the profanity filter on Bedrock.",
    ],
    [
      "What age does Minecraft need a child Microsoft account?",
      "Below 13 — the US COPPA threshold Microsoft applies — the account has to be a child account inside a Microsoft family group, and an adult must approve online play and communication. From 13 the child can manage more settings themselves, but keeping them in the family group preserves screen-time limits, spending approval and activity reports.",
    ],
    [
      "Are Minecraft Realms safer than public servers?",
      "Generally yes, because a Realm is invite-only and holds up to 10 players online at once, all added by the owner. The two things that undo that are sharing the Realm invite link rather than inviting by gamertag, and handing out Operator permissions — set friends to Member or Visitor instead and reset the invite link if it has been forwarded.",
    ],
    [
      "Can I stop Minecoin and Marketplace purchases?",
      "Yes. In Microsoft Family Safety, turn on 'Ask a parent' for spending and remove any saved card from the child's account, so Marketplace skins, maps and coin packs need your approval. This also removes the pressure other players apply when they ask a child to buy or trade items.",
    ],
  ],
};

export default seo;
