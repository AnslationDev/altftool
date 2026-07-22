export const CREATORS = [
  { id: "c1", name: "Aria Snow", handle: "ariasnow", avatarSeed: "aria", verified: true, followers: 48200, prompts: 312, specialty: "Fashion & Beauty" },
  { id: "c2", name: "Kenji Watanabe", handle: "kenjiw", avatarSeed: "kenji", verified: true, followers: 39100, prompts: 271, specialty: "Anime & Character" },
  { id: "c3", name: "Lucia Ferreira", handle: "luciaf", avatarSeed: "lucia", verified: true, followers: 61500, prompts: 402, specialty: "Cinematic" },
  { id: "c4", name: "Marcus Cole", handle: "mcole", avatarSeed: "marcus", verified: false, followers: 21800, prompts: 158, specialty: "Product & Ads" },
  { id: "c5", name: "Priya Nair", handle: "priyacreates", avatarSeed: "priya", verified: true, followers: 55300, prompts: 366, specialty: "Architecture" },
  { id: "c6", name: "Diego Alvarez", handle: "diegoa", avatarSeed: "diego", verified: false, followers: 17400, prompts: 121, specialty: "Sci-Fi & Worlds" },
  { id: "c7", name: "Yuki Tanaka", handle: "yukiart", avatarSeed: "yuki", verified: true, followers: 72900, prompts: 489, specialty: "Concept Art" },
  { id: "c8", name: "Noah Bennett", handle: "noahb", avatarSeed: "noah", verified: false, followers: 14200, prompts: 98, specialty: "Photography" },
  { id: "c9", name: "Sofia Rossi", handle: "sofiar", avatarSeed: "sofia", verified: true, followers: 46700, prompts: 288, specialty: "Food & Lifestyle" },
  { id: "c10", name: "Ahmet Ertuğrul", handle: "ahmete", avatarSeed: "ahmet", verified: true, followers: 33500, prompts: 224, specialty: "Infographics" },
  { id: "c11", name: "Elena Volkova", handle: "elenav", avatarSeed: "elena", verified: false, followers: 26900, prompts: 176, specialty: "Fantasy" },
  { id: "c12", name: "Jamal Carter", handle: "jamalc", avatarSeed: "jamal", verified: true, followers: 58100, prompts: 341, specialty: "Marketing" },
  { id: "c13", name: "Mei Lin", handle: "meilin", avatarSeed: "mei", verified: true, followers: 64400, prompts: 421, specialty: "Healthcare Viz" },
  { id: "c14", name: "Oliver Grant", handle: "olivergrant", avatarSeed: "oliver", verified: false, followers: 19100, prompts: 133, specialty: "3D Render" },
  { id: "c15", name: "Zara Malik", handle: "zaramalik", avatarSeed: "zara", verified: true, followers: 51200, prompts: 309, specialty: "Gaming & NFT" },
  { id: "c16", name: "Theo Laurent", handle: "theol", avatarSeed: "theo", verified: false, followers: 22600, prompts: 164, specialty: "Cyberpunk" },
];

export const CREATORS_BY_ID = Object.fromEntries(CREATORS.map((c) => [c.id, c]));

export const FEATURED_CREATORS = CREATORS.filter((c) => c.verified).slice(0, 8);
