const seo = {
  title: "Constellation Finder: 16 Constellations by Season",
  metaDescription:
    "An interactive star chart with 16 constellations — Orion, Ursa Major, Scorpius and more. Filter by season; click any star for its magnitude and distance.",
  intro:
    "Constellation Finder is an interactive star chart that draws 16 major constellations — Orion, Ursa Major, Ursa Minor, Cassiopeia, Scorpius, Leo, Cygnus, Taurus, Gemini, Canis Major, Lyra, Crux, Pegasus, Andromeda, Draco and Sagittarius — as pannable, zoomable line figures on a simulated night sky. Each constellation carries its genitive form, brightest star with apparent magnitude, mythological story and observing notes, and every plotted star shows its magnitude, distance in light-years and spectral type. It is built for beginners learning to star-hop and for anyone trying to identify a shape they saw last night.",
  useCases: [
    "You spotted three bright stars in a straight row last night and want to confirm it was Orion's Belt — Alnitak, Alnilam and Mintaka — before pointing it out to your kids.",
    "You are planning an August camping trip and want to filter the chart to Summer constellations so you know Scorpius, Cygnus, Lyra and Sagittarius are the ones worth waiting up for.",
    "You are helping with a school astronomy project and need each star's apparent magnitude and spectral class — for example Betelgeuse at magnitude 0.50, spectral type M2Iab, roughly 643 light-years away.",
  ],
  benefits: [
    ["Star sizes follow real magnitudes", "Dots are scaled and dimmed from each star's apparent magnitude, so the chart looks like the sky rather than a uniform dot diagram."],
    ["Season filter narrows the search", "Switching to Spring, Summer, Fall or Winter hides the constellations that are not well placed, so you compare only shapes you can actually see tonight."],
    ["Every star is labelled, not just the pattern", "Tap any node to get its proper name, magnitude, distance in light-years and spectral type instead of an unlabelled connect-the-dots outline."],
  ],
  faqs: [
    [
      "How many constellations can I look up here?",
      "Sixteen of the most recognisable constellations are charted, covering all four seasons plus the southern Crux. The official IAU list has 88 constellations in total, so this is a starter set of the ones a naked-eye observer is most likely to pick out.",
    ],
    [
      "What does the magnitude number next to each star mean?",
      "Apparent magnitude measures brightness on a reversed scale — lower is brighter, and each step of 1 magnitude is about 2.5 times the light. Rigel at 0.13 is far brighter than Megrez at 3.31, and most people can see down to about magnitude 6 from a dark site.",
    ],
    [
      "Why can I never see Orion and Scorpius on the same night?",
      "They sit almost 180 degrees apart on the celestial sphere, so as one rises the other is setting. The myth built around that fact — Gaia's scorpion pursuing the hunter — is one of the stories included with both charts.",
    ],
    [
      "Is the Big Dipper a constellation?",
      "No, it is an asterism — a recognisable pattern of seven stars inside the larger constellation Ursa Major. Its two end stars, Dubhe and Merak, point roughly five times their own separation to Polaris, the pole star in Ursa Minor.",
    ],
  ],
  steps: [
    "Type a name or meaning into the Search constellations… box, or narrow the chart with the season tabs — ★ All, Spring, Summer, Fall and Winter. If nothing matches, the sky map prints No constellations match your search.",
    "Click a star on the map to select its constellation: its lines brighten and its name is drawn above the pattern. The on-canvas hint reads Scroll to zoom · Drag to pan · Click a star, and the toolbar's zoom out, zoom in and reset view buttons work either side of the percentage readout, between 30% and 600%.",
    "The panel on the right switches from No constellation selected to the constellation's season, genitive, name and meaning, with Brightest star, Stars counted, a Major stars list giving each star's magnitude in mag and distance in ly, and Mythology and Did you know? notes.",
  ],
};

export default seo;
