const seo = {
  intro:
    "A key signature quiz turns a printed group of sharps or flats into the major and minor key it represents, then tests you on it with instant scoring. It uses the circle of fifths and the two standard reading rules: the major key sits one semitone above the last sharp, and with two or more flats the second-to-last flat names the key. Built for music students, choir and band players and anyone sight-reading unfamiliar scores who wants the answer and the reasoning together.",
  useCases: [
    "Drill the fifteen standard signatures before a graded theory exam such as ABRSM or Trinity Grade 3 to 5.",
    "Check whether a piece with four flats is A♭ major or its relative F minor before working out the chords.",
    "Practise minor keys separately when relative minors are the part you keep getting wrong.",
    "Give a class a fresh randomised question set each lesson without preparing worksheets.",
  ],
  benefits: [
    ["Rule shown with every answer", "Each result names the last sharp or second-to-last flat so you learn the shortcut, not the list."],
    ["Major, minor or mixed", "Switch between naming the major key, the relative minor, or a mix of both in one set."],
    ["Full reference table", "All fifteen signatures from seven flats to seven sharps stay on screen for checking."],
  ],
  faqs: [
    [
      "How do you work out a key signature from the sharps?",
      "Take the last sharp in the signature and go up one semitone: that is the major key. Four sharps end on D♯, so the key is E major, and the relative minor is C♯ minor, a minor third below.",
    ],
    [
      "What is the trick for reading flat key signatures?",
      "With two or more flats, the second-to-last flat is the name of the major key. Five flats read B♭ E♭ A♭ D♭ G♭, so the second-to-last is D♭ and the key is D♭ major. One flat is the exception you memorise: B♭ alone means F major or D minor.",
    ],
    [
      "How many key signatures are there?",
      "Fifteen in common-practice notation: seven flats through seven sharps plus the empty signature. Each one carries a major key and its relative minor, so the quiz covers 30 key names in total.",
    ],
    [
      "What order do sharps and flats appear in?",
      "Sharps always follow F C G D A E B, each a perfect fifth above the last, and flats follow the reverse, B E A D G C F. The mnemonics are 'Father Charles Goes Down And Ends Battle' read forwards for sharps and backwards for flats.",
    ],
  ],
};

export default seo;
