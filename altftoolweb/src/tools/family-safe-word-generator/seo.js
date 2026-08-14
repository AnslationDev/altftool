const seo = {
  title: "Family Safe Word Generator: 5 Words, 42.6 Bits",
  metaDescription:
    "Draws a verification phrase from a 92-word list with crypto.getRandomValues; five words plus three digits gives about 42.6 bits. Never transmitted.",
  steps: [
    "Under Your private phrase, set Number of words and Final digits — the default five words plus three digits is about 42.6 bits from the 92-word pool.",
    "Press Generate private phrase; changing the selectors afterwards does not replace what is shown until you press Generate another, so nothing is overwritten by accident.",
    "Press Copy phrase and record it offline, checking the Estimated search space in bits printed beneath the phrase.",
  ],
  intro:
    "The Family Safe-Word Generator builds a spoken verification phrase by drawing words at random from a fixed 92-word list of plain, easily heard English nouns and appending random digits — the default of five words plus three digits gives about 42.6 bits of entropy. Every character comes from the browser's crypto.getRandomValues with rejection sampling, so no word or digit is more likely than another, and the phrase is never stored or transmitted. It is for families who want an agreed answer to the question \"prove it's really you\" when a call, voice note or message claims there is an emergency.",
  useCases: [
    "A parent gets a call in a voice that sounds like their child saying they have been in an accident and need money transferred now — the family safe word is what the parent asks for before doing anything else.",
    "A grandparent has been targeted by scam calls before, so the family agrees one phrase, writes it on paper in the house rather than in a group chat, and everyone practises asking for it in full.",
    "A teenager travelling alone needs a way for a relative picking them up unexpectedly to prove they were actually sent by the family, so the phrase doubles as the pickup password.",
  ],
  benefits: [
    ["Chosen to survive a bad phone line", "The 92-word pool is short, concrete nouns like harbor, thistle and quartz, so the phrase can be said and heard correctly over a poor connection or a crying voice."],
    ["Unbiased random selection", "Words and digits are drawn with crypto.getRandomValues plus rejection sampling, which removes the modulo bias that a naive random index would introduce."],
    ["Comes with a usage protocol", "Alongside the phrase you get the rules that make it work — ask for the whole phrase, give no hints, hang up and call back on a saved number, and replace the phrase after any real use."],
  ],
  faqs: [
    [
      "How strong is the generated family safe word?",
      "The default five words plus three digits is roughly 42.6 bits of entropy, drawn from a 92-word pool. You can shorten to four words and two digits for about 32.7 bits or extend to six words and four digits for about 52.4 bits — for a phrase a caller must say aloud, guessing is not the realistic attack, so favour a length everyone can actually remember.",
    ],
    [
      "What is a family safe word for?",
      "It is a shared phrase used to verify that an urgent caller or message really is your relative, which defeats scams built on cloned voices or hijacked accounts. The rule that makes it effective is simple: no money, no codes and no personal details move until the whole phrase has been said correctly.",
    ],
    [
      "Where should we keep the phrase?",
      "Somewhere offline and out of any messaging app — written on paper at home, or in each person's password manager. Sending it in a family group chat or an email puts it in the exact account a scammer would compromise first.",
    ],
    [
      "When should we change the safe word?",
      "Replace it after any real incident where it was spoken, after it has been shared over a channel you do not control, and whenever someone who knew it is no longer part of the trusted group. A phrase used once during a live scam attempt should be treated as burned.",
    ],
  ],
};

export default seo;
