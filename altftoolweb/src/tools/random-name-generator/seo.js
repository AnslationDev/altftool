const seo = {
  title: "Random Name Generator: Up to 50 Full Names",
  metaDescription:
    "Pairs a given name with a surname from 130 first names and 50 surnames. Pick Any, Male, Female or Neutral, set 1 to 50, and Copy All one name per line.",
  steps: [
    "Under Name Options pick a Gender filter — Any, Male, Female or Neutral.",
    "Drag the \"How Many?\" slider anywhere from 1 to 50, then click \"Generate Names\".",
    "Under Generated Names, copy a single name with its row button or press \"Copy All\" to put the whole batch on the clipboard, one name per line.",
  ],
  intro:
    "Random Name Generator pairs a randomly drawn first name with a randomly drawn surname to produce up to 50 full names at once, using lists of 50 common masculine, 50 feminine and 30 gender-neutral given names plus 50 widely used English-language surnames. Choose Any, Male, Female or Neutral, drag the slider to the number you need, and copy a single name or the whole batch as newline-separated text. It is aimed at writers, game masters and developers who need plausible, ordinary-sounding names rather than fantasy ones.",
  useCases: [
    "You are drafting a novel or screenplay and need twenty background characters named in one go, so nobody ends up as \"the man at the desk\" in chapter nine.",
    "You need realistic-looking placeholder people for a demo database, a design mockup or a test fixture, and want names that read naturally without using anyone's real identity.",
    "You are running a tabletop session and a player talks to an NPC you never planned, so you pull a neutral-list name in one click and keep the scene moving.",
  ],
  benefits: [
    ["Neutral names are always in the mix", "Choosing Male or Female still draws from the 30 gender-neutral names alongside that list, so batches do not read as stereotyped."],
    ["Batch of up to 50 in one pull", "The slider goes from 1 to 50 and Copy All puts the whole list on your clipboard one name per line, ready to paste into a document or spreadsheet."],
    ["Plausible, not fantastical", "The pools are ordinary English-language given names and surnames, so results pass as real people instead of invented syllables."],
  ],
  faqs: [
    [
      "How many names can I generate at once?",
      "Between 1 and 50 per click, set with the slider. Generating again replaces the current list rather than adding to it, so copy a batch before you re-roll.",
    ],
    [
      "How many different names are possible?",
      "On the Any setting there are 6,500 combinations — 130 first names (50 masculine, 50 feminine, 30 neutral) crossed with 50 surnames. Male and Female draw from 80 first names each, and Neutral from 30, giving 4,000 and 1,500 combinations respectively.",
    ],
    [
      "Why did the same name appear twice in one batch?",
      "Each name is drawn independently, so repeats are expected rather than a bug — asking for 50 names from a 6,500-combination pool makes a duplicate quite likely. Generate again or pull a larger batch and delete the repeats.",
    ],
    [
      "Can I use these names for a character or a company?",
      "The generator only recombines common given names and surnames, so any result may match a real living person by coincidence. That is fine for fiction and test data, but check for real-world conflicts before attaching a generated name to a public figure, a brand or anything you intend to register.",
    ],
  ],
};

export default seo;
