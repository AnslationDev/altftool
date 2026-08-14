const heroImage = { src: "/kym-images/kym-27.jpg" };
const img20 = { src: "/kym-images/kym-20.jpg" };
const img21 = { src: "/kym-images/kym-21.jpg" };
const img23 = { src: "/kym-images/kym-23.jpg" };
const img24 = { src: "/kym-images/kym-24.jpg" };
const img28 = { src: "/kym-images/kym-28.jpg" };
const img29 = { src: "/kym-images/kym-29.jpg" };
const img30 = { src: "/kym-images/kym-30.jpg" };
const img31 = { src: "/kym-images/kym-31.jpg" };
const img47 = { src: "/kym-images/kym-47.jpg" };
const img51 = { src: "/kym-images/kym-51.jpg" };
const img52 = { src: "/kym-images/kym-52.png" };
const img54 = { src: "/kym-images/kym-54.png" };

export const pollPage = {
  category: "Poll",
  title: "Choose Your Pick For May 2026's Meme Of The Month",
  date: "May 29, 2026",
  heroImage,
  intro:
    "May brought a fresh wave of viral edits, redraws, reaction formats and discourse-fueled memes. Pick the entry you think best defined the month.",
};

export const pollOptions = [
  ["What Does 'Weird Al' Pull The Strings?", img20],
  ["Nahhh Wait You Look Tuff I'm Taking A Photo", img24],
  ["Will Levis And Gia Duddy", img21],
  ["Billy Butcher Edits", img23],
  ["Fallenchungus", img28],
  ["Gameoverse", img29],
  ["Will Smith Presenting", img30],
  ["Homelander Death Scene Parodies", img31],
  ["The Realistic Troll Face", img47],
  ["It's What Clara Would Have Wanted", img51],
  ["HolyClothing Meme Controversy", img52],
  ["Vocaloid", img54],
].map(([title, image], index) => ({
  id: index + 1,
  title,
  image,
  // No `votes` field. Each option used to carry a hardcoded percentage
  // ([18, 13, 11, ...]) rendered as "18% of sample votes". No vote was ever
  // counted — the poll writes nothing to a server — so the numbers were
  // invented. Do not reintroduce them.
}));

// pollComments removed: three invented commenters ("MemeArchivist",
// "InternetResident", "PanelEnjoyer") with invented comment text were seeded
// into the comment thread as if real readers had posted them.
export const pollComments = [];
