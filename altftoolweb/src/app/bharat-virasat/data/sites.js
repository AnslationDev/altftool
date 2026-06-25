const img = (id, crop = "") =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1600${crop}`;

// crop variants of the SAME image (different framings give visual variety)
const v = {
  top: "&crop=entropy",
  portrait: "&h=1600&w=1100",
  wide: "&h=900&w=1800",
  square: "&h=1200&w=1200",
};

export const SITES = [
  {
    id: "taj",
    name: "Taj Mahal",
    place: "Agra, Uttar Pradesh",
    year: "1983",
    type: "Cultural",
    tagline: "A marble poem to love",
    description:
      "Commissioned by Shah Jahan in memory of Mumtaz Mahal. The ivory-white marble mausoleum, with its perfect symmetry and pietra dura inlay, glows differently at every hour of the day.",
    images: [
      img(11948442), // BACKGROUND – do not change
      img(29018572), img(27970036), img(6618044), img(4799157),
      img(17423832), img(32261869), img(32261878), img(32261882), img(37126715), img(14643521), img(32261868),
      img(11948442, v.portrait), img(29018572, v.wide), img(27970036, v.square),
    ],
    gallery: [
      img(29018572), img(27970036), img(6618044), img(4799157),
      img(17423832), img(32261869), img(32261878), img(32261882), img(37126715), img(14643521), img(32261868),
      img(11948442, v.portrait), img(29018572, v.wide), img(27970036, v.square),
    ],
    wikiTitle: "Taj_Mahal",
    details: {
      history:
        "Construction began in 1632, a year after Mumtaz Mahal died giving birth to their 14th child. It took 22 years, 20,000 artisans and 1,000 elephants to complete. Materials came from Punjab, China, Tibet, Sri Lanka and Arabia. Shah Jahan was later imprisoned by his son Aurangzeb in Agra Fort, from where he gazed at the Taj until his death.",
      architecture:
        "A perfectly symmetrical Indo-Islamic mausoleum on a raised marble plinth, flanked by four 40m minarets that tilt slightly outwards (so they fall away from the tomb in an earthquake). The central onion dome rises 73m. Calligraphy of Quranic verses is sized to appear uniform from below — letters get larger as they rise. Pietra dura inlay uses 28 types of semi-precious stones.",
      highlights: [
        "Changes colour: pinkish at dawn, milky white at noon, golden by moonlight",
        "Reflecting pool of the charbagh garden frames the icon",
        "Calligraphy by Amanat Khan, the only artisan signed",
        "UNESCO inscribed 1983 — one of the New Seven Wonders",
      ],
      bestTime: "October to March. Visit at sunrise for the soft light and fewer crowds.",
      howToReach: "Agra is 230km from Delhi; ~3hrs by Gatimaan Express. Closed on Fridays.",
    },
  },
  {
    id: "ellora",
    name: "Ellora Caves",
    place: "Maharashtra",
    year: "1983",
    type: "Cultural",
    tagline: "A mountain carved from the top down",
    description:
      "34 monasteries and temples cut from basalt cliffs between 600–1000 CE. Its Kailasa Temple is the largest monolithic structure in the world.",
    images: [
      img(31912392), // BG
      img(31912390), img(32325834), img(36098238), img(31912391), img(32325840),
      img(37517532), img(37540779), img(32325836), img(32442600), img(37363554), img(32325838), img(35561037),
      img(31912392, v.portrait), img(36098238, v.wide),
    ],
    gallery: [
      img(31912390), img(32325834), img(36098238), img(31912391), img(32325840),
      img(37517532), img(37540779), img(32325836), img(32442600), img(37363554), img(32325838), img(35561037),
      img(31912392, v.portrait), img(36098238, v.wide),
    ],
    details: {
      history:
        "Excavated under the Rashtrakuta and Yadava dynasties between the 6th-10th centuries. 17 Hindu caves, 12 Buddhist, and 5 Jain — a rare site of three religions coexisting. The Kailasa (Cave 16) was carved top-down from a single basalt cliff over 150 years, removing 200,000 tonnes of rock.",
      architecture:
        "Each cave is a sculptural feat. Kailasa Temple represents Mount Kailash, with full-size elephants, lions and a courtyard surrounded by a two-storey gallery — all from one piece of stone. Buddhist caves include the Vishvakarma chaitya hall with its 'carpenter's cave' ribbed ceiling.",
      highlights: [
        "Cave 16 (Kailasa) — twice the area of the Parthenon, 1.5x its height",
        "Cave 10 — chaitya hall with stone-carved 'wooden' beams",
        "Cave 32 — Indra Sabha, the finest Jain cave",
        "Daily play of shadows over Ramayana friezes",
      ],
      bestTime: "October to February. Open all year except Tuesdays.",
      howToReach: "30km from Aurangabad. Combine with Ajanta over 2-3 days.",
    },
  },
  {
    id: "ajanta",
    name: "Ajanta Caves",
    place: "Maharashtra",
    year: "1983",
    type: "Cultural",
    tagline: "Painted prayers in a horseshoe gorge",
    description:
      "29 Buddhist cave monuments with masterful murals narrating the Jataka tales. Pigments survive two millennia, lit only by oil lamps.",
    images: [
      img(36098246), // BG
      img(32142489), img(36098238), img(31912390), img(31912391),
      img(34318489), img(31928531), img(34318485), img(32142490), img(31928535), img(32325843), img(32325841),
      img(36098246, v.portrait), img(32142489, v.wide),
    ],
    gallery: [
      img(32142489), img(36098238), img(31912390), img(31912391),
      img(34318489), img(31928531), img(34318485), img(32142490), img(31928535), img(32325843), img(32325841),
      img(36098246, v.portrait), img(32142489, v.wide),
    ],
    details: {
      history:
        "Forgotten for over a thousand years, rediscovered in 1819 by a British officer hunting tigers. Carved in two phases: 2nd century BCE (Hinayana) and 5th-6th century CE (Mahayana), under the Vakataka dynasty. The murals are the finest surviving examples of ancient Indian painting.",
      architecture:
        "29 caves arranged in a horseshoe around the Waghora River. Chaityas (prayer halls) and viharas (monasteries) cut into basalt. Murals use natural pigments — ochre, lapis lazuli, lampblack — applied wet on a thin lime plaster.",
      highlights: [
        "Cave 1 — Padmapani Bodhisattva, the Mona Lisa of India",
        "Cave 17 — the most elaborate Jataka cycle",
        "Cave 26 — reclining Parinirvana Buddha, 7m long",
        "Acoustics of Cave 19 chaitya: a single chant resonates",
      ],
      bestTime: "November to March. Closed Mondays.",
      howToReach: "100km from Aurangabad. Best paired with Ellora.",
    },
  },
  {
    id: "agra-fort",
    name: "Agra Fort",
    place: "Agra, Uttar Pradesh",
    year: "1983",
    type: "Cultural",
    tagline: "Red sandstone power",
    description:
      "Mughal stronghold of red sandstone, where Shah Jahan was imprisoned overlooking his beloved Taj across the Yamuna.",
    images: [
      img(33705809), // BG
      img(3844593), img(19149618), img(4799157), img(11948442),
      img(33705809, v.portrait), img(19149618, v.wide),
    ],
    gallery: [
      img(3844593), img(19149618), img(4799157), img(11948442),
      img(33705809, v.portrait), img(19149618, v.wide),
    ],
    details: {
      history:
        "Built by Akbar from 1565 on the site of an earlier brick Sikarwar fort. Each emperor added his own palaces. Shah Jahan rebuilt parts in white marble. Captured by the Marathas in 1761, then the British in 1803. Witnessed the 1857 uprising.",
      architecture:
        "Crescent-shaped, 2.5km walls of red sandstone rising 21m, surrounded by a 9m moat. Houses Diwan-i-Aam (public audience), Diwan-i-Khas (private audience), Sheesh Mahal (mirror palace), and Musamman Burj — the marble tower where Shah Jahan died.",
      highlights: [
        "Best Taj view across the Yamuna from Musamman Burj",
        "Jahangir's Mahal — pure Akbari red sandstone palace",
        "Khas Mahal — Shah Jahan's white marble pavilions",
        "Anguri Bagh — grape garden with parterres",
      ],
      bestTime: "October to March. Open all days.",
      howToReach: "2.5km from the Taj Mahal — easy walk or rickshaw.",
    },
  },
  {
    id: "konark",
    name: "Sun Temple, Konark",
    place: "Odisha",
    year: "1984",
    type: "Cultural",
    tagline: "The chariot of Surya",
    description:
      "A 13th-century temple conceived as the colossal chariot of the Sun God, drawn by seven horses with 24 intricately carved wheels.",
    images: [
      img(6040175), // BG
      img(6040174), img(31598958), img(1721747), img(37437100),
      img(37437098), img(6040177), img(32888176), img(29065084), img(12871861),
      img(6040175, v.portrait), img(31598958, v.wide),
    ],
    gallery: [
      img(6040174), img(31598958), img(1721747), img(37437100),
      img(37437098), img(6040177), img(32888176), img(29065084), img(12871861),
      img(6040175, v.portrait), img(31598958, v.wide),
    ],
    details: {
      history:
        "Built around 1250 CE by King Narasimhadeva I of the Eastern Ganga dynasty to commemorate a military victory. The main tower (deul) collapsed in the 19th century; what survives is the jagamohana (assembly hall) and the dance hall (nata mandapa).",
      architecture:
        "Designed as Surya's celestial chariot — 7 horses, 12 pairs of wheels (each a functional sundial), pulling a temple 30m wide and 39m high. Carved in chlorite, khondalite and laterite. The walls overflow with deities, musicians, dancers, hunters, lovers and erotic scenes from the Kama Sutra.",
      highlights: [
        "The 24 wheels — each a sundial accurate to minutes",
        "Aruna Stambha, the tall pillar at the entrance",
        "Friezes of elephants in procession",
        "Konark Dance Festival every December",
      ],
      bestTime: "October to February. Combine with Puri.",
      howToReach: "35km from Puri, 65km from Bhubaneswar.",
    },
  },
  {
    id: "mahabalipuram",
    name: "Mahabalipuram",
    place: "Tamil Nadu",
    year: "1984",
    type: "Cultural",
    tagline: "Pallava poetry by the sea",
    description:
      "7th-century rock-cut shore temples, monolithic Rathas and the open-air Arjuna's Penance — the cradle of South Indian architecture.",
    images: [
      img(5273412), // BG
      img(14721494), img(14721496), img(27926507), img(18320349),
      img(5273412, v.portrait), img(14721496, v.wide),
    ],
    gallery: [
      img(14721494), img(14721496), img(27926507), img(18320349),
      img(5273412, v.portrait), img(14721496, v.wide),
    ],
    details: {
      history:
        "Active port and artistic capital of the Pallava dynasty (7th-9th c.). Named after the king Mamalla (Narasimhavarman I). Pallava artists pioneered the transition from rock-cut to structural temple architecture, influencing all of South & Southeast Asia.",
      architecture:
        "Five styles in one site: 1) Shore Temple — twin spires of structural granite. 2) Pancha Rathas — five monolithic temples carved as chariots, each in a different roof style. 3) Mandapas — pillared rock-cut halls. 4) Arjuna's Penance — 30m bas-relief on a single boulder. 5) Krishna's Butterball — a 250-tonne balanced rock.",
      highlights: [
        "Shore Temple at sunrise over the Bay of Bengal",
        "Descent of the Ganges relief, the world's largest open-air carving",
        "Five Rathas — Dharmaraja, Bhima, Arjuna, Nakula-Sahadeva, Draupadi",
        "December Dance Festival against floodlit temples",
      ],
      bestTime: "November to February.",
      howToReach: "55km south of Chennai on the East Coast Road.",
    },
  },
  {
    id: "kaziranga",
    name: "Kaziranga National Park",
    place: "Assam",
    year: "1985",
    type: "Natural",
    tagline: "Two-thirds of the world's rhinos",
    description:
      "Floodplains of the Brahmaputra shelter Indian one-horned rhinos, tigers, elephants and migratory birds in dense elephant grass.",
    images: [
      img(37623729), // BG
      img(37623483), img(8057396), img(30542359), img(6387604), img(10531628),
      img(37623729, v.portrait),
    ],
    gallery: [
      img(37623483), img(8057396), img(30542359), img(6387604),
      img(10531628), img(37623729, v.portrait),
    ],
    details: {
      history:
        "Mary Curzon, wife of Viceroy Lord Curzon, visited in 1904 to see a rhino but found none — leading to its protection in 1905. Rhino population was 12 then; today it's over 2,613. Declared a national park in 1974 and tiger reserve in 2006.",
      architecture:
        "1,090 sq km of grasslands, swamps and tropical broadleaf forest on the Brahmaputra floodplain. Annual monsoon floods recycle nutrients but also drown wildlife — they must migrate to higher ground.",
      highlights: [
        "2,613+ Indian one-horned rhinos (2/3 of world total)",
        "Highest tiger density in India",
        "Wild Asian elephants, swamp deer, wild water buffalo",
        "Migratory birds: pelicans, storks, eagles",
      ],
      bestTime: "November to April. Closed monsoon (May-Oct).",
      howToReach: "Fly to Guwahati or Jorhat; 4-5 hr drive. Jeep & elephant safaris available.",
    },
  },
  {
    id: "manas",
    name: "Manas Wildlife Sanctuary",
    place: "Assam",
    year: "1985",
    type: "Natural",
    tagline: "River, grassland, tiger",
    description:
      "Bhutan border biosphere reserve known for golden langurs, pygmy hogs and Bengal tigers along the Manas river.",
    images: [
      img(36530920), // BG
      img(36530918), img(12000869), img(8057396), img(30542359), img(6387604),
      img(36530920, v.portrait),
    ],
    gallery: [
      img(36530918), img(12000869), img(8057396), img(30542359),
      img(6387604), img(36530920, v.portrait),
    ],
    details: {
      history:
        "Declared a sanctuary in 1928, World Heritage Site in 1985. Placed on the 'In Danger' list during the Bodo insurgency (1992-2011), then restored after peace. Contiguous with Royal Manas in Bhutan.",
      architecture:
        "950 sq km of alluvial grasslands, evergreen forest and the meandering Manas river that defines the India-Bhutan border. The 'Bhabar' tract of porous boulder beds gives way to 'Terai' grasslands.",
      highlights: [
        "Only home to the endemic pygmy hog (world's smallest pig)",
        "Golden langur — discovered to science only in 1953",
        "Hispid hare, capped langur, Bengal florican",
        "Cross-border tiger and elephant movement",
      ],
      bestTime: "November to April.",
      howToReach: "176km from Guwahati. Stay at Bansbari or Mathanguri.",
    },
  },
  {
    id: "keoladeo",
    name: "Keoladeo National Park",
    place: "Bharatpur, Rajasthan",
    year: "1985",
    type: "Natural",
    tagline: "An ornithologist's dream",
    description:
      "Man-made wetland hosting 370+ bird species — Siberian cranes, painted storks, kingfishers and herons.",
    images: [
      img(6387604), // BG
      img(10531628), img(30542359), img(8057396), img(37623729), img(37623483),
      img(6387604, v.portrait),
    ],
    gallery: [
      img(10531628), img(30542359), img(8057396), img(37623729),
      img(37623483), img(6387604, v.portrait),
    ],
    details: {
      history:
        "Created in the 1850s by the Maharaja of Bharatpur as a duck-shoot reserve. Up to 4,000 birds were shot in a single day until protection began in 1971. Named after a Keoladeo (Shiva) temple inside the park.",
      architecture:
        "29 sq km of man-made marshes flooded by the Ajan Bund. A patchwork of shallow lakes, mounds and grasslands designed to attract waterfowl.",
      highlights: [
        "Wintering ground for migratory cranes from Siberia",
        "375+ bird species recorded",
        "Painted storks, spoonbills, openbills nesting in tree colonies",
        "Cycle-rickshaw rides with trained naturalist drivers",
      ],
      bestTime: "October to February for migratory birds.",
      howToReach: "180km from Delhi or Jaipur. Bharatpur railway station 5km away.",
    },
  },
  {
    id: "churches-goa",
    name: "Churches & Convents of Goa",
    place: "Old Goa",
    year: "1986",
    type: "Cultural",
    tagline: "Baroque on the Mandovi",
    description:
      "Portuguese ecclesiastical complex — Basilica of Bom Jesus holds the relics of St. Francis Xavier. Manueline, Mannerist and Baroque under tropical skies.",
    images: [
      img(11438923), // BG
      img(31848009), img(35401276), img(15371756), img(21363831),
      img(11438923, v.portrait), img(35401276, v.wide),
    ],
    gallery: [
      img(31848009), img(35401276), img(15371756), img(21363831),
      img(11438923, v.portrait), img(35401276, v.wide),
    ],
    details: {
      history:
        "Old Goa was the capital of Portuguese India from 1510-1843, once larger than Lisbon. Cholera epidemics in the 17th century emptied the city, leaving only the churches. The body of St. Francis Xavier (d. 1552) is enshrined here.",
      architecture:
        "Seven monuments showcase the evolution from Portuguese Manueline to Mannerist to Baroque to Rococo. Built of red laterite, plastered and limewashed brilliant white, with carved Goan rosewood interiors.",
      highlights: [
        "Basilica of Bom Jesus — Baroque masterpiece with the relics of St. Xavier",
        "Sé Cathedral — largest church in Asia at the time",
        "Church of St. Francis of Assisi — Manueline doorway",
        "Exposition of St. Xavier's body every 10 years",
      ],
      bestTime: "November to February. Sundays for mass.",
      howToReach: "10km from Panjim. Combine with the museum complex.",
    },
  },
  {
    id: "fatehpur",
    name: "Fatehpur Sikri",
    place: "Uttar Pradesh",
    year: "1986",
    type: "Cultural",
    tagline: "Akbar's red sandstone city",
    description:
      "Mughal capital built by Akbar in 1571, abandoned for want of water. Buland Darwaza, Diwan-i-Khas and Jodha Bai's palace stand frozen in time.",
    images: [
      img(3844593), // BG
      img(19149618), img(33705809), img(11948442), img(4799157),
      img(3844593, v.portrait), img(33705809, v.wide),
    ],
    gallery: [
      img(19149618), img(33705809), img(11948442), img(4799157),
      img(3844593, v.portrait), img(33705809, v.wide),
    ],
    details: {
      history:
        "Built 1571-1585 to honour the Sufi saint Salim Chishti, who prophesied Akbar's son Salim (Jahangir). Akbar lived here only 14 years before abandoning it — water supply failed and political needs called him north.",
      architecture:
        "A perfectly preserved Mughal city in red sandstone, blending Hindu, Persian and Islamic styles. The buildings imitate timber construction in stone — every bracket, beam and column is sandstone copying wood.",
      highlights: [
        "Buland Darwaza — 54m gateway, the tallest in the world",
        "Diwan-i-Khas — single central pillar supporting Akbar's throne",
        "Panch Mahal — five-storey breezy pavilion for the harem",
        "Tomb of Salim Chishti — pilgrimage site for childless couples",
      ],
      bestTime: "October to March.",
      howToReach: "40km from Agra, easy day trip.",
    },
  },
  {
    id: "hampi",
    name: "Group of Monuments at Hampi",
    place: "Karnataka",
    year: "1986",
    type: "Cultural",
    tagline: "Boulders, bazaars, an empire",
    description:
      "Ruins of Vijayanagara, last great Hindu kingdom. The musical pillars of the Vitthala temple and the Stone Chariot are iconic.",
    images: [
      img(18320349), // BG
      img(27926507), img(28656056), img(14721496), img(14721494), img(5273412),
      img(32547462), img(14721497), img(37040437), img(18331990),
      img(18320349, v.portrait), img(28656056, v.wide),
    ],
    gallery: [
      img(27926507), img(28656056), img(14721496), img(14721494),
      img(5273412), img(32547462), img(14721497), img(37040437), img(18331990),
      img(18320349, v.portrait), img(28656056, v.wide),
    ],
    details: {
      history:
        "Capital of the Vijayanagara Empire (1336-1565), at one point the second-largest city in the world after Beijing. Visited by Persian, Portuguese and Italian travellers who marvelled at its wealth. Sacked by the Deccan Sultanates after the Battle of Talikota (1565) and never rebuilt.",
      architecture:
        "26 sq km of boulder-strewn landscape with 1,600+ monuments — temples, palaces, water tanks, royal enclosures, bazaars. Dravidian temple style with characteristic Vijayanagara additions: massive gopurams, intricate pillared mandapas, and yali (mythical lion) columns.",
      highlights: [
        "Stone Chariot at Vitthala Temple — on the ₹50 note",
        "Musical pillars that produce notes when struck",
        "Virupaksha Temple — still active worship since 7th century",
        "Lotus Mahal & Elephant Stables in the royal enclosure",
        "Sunset from Matanga Hill over the Tungabhadra",
      ],
      bestTime: "October to February.",
      howToReach: "Nearest railhead Hospet (13km). Fly to Hubli or Bellary.",
    },
  },
  {
    id: "khajuraho",
    name: "Khajuraho Group of Monuments",
    place: "Madhya Pradesh",
    year: "1986",
    type: "Cultural",
    tagline: "Life celebrated in sandstone",
    description:
      "Nagara-style Chandela temples (950-1050 CE) renowned for sculpting human, divine and erotic life with unmatched delicacy.",
    images: [
      img(36737766), // BG
      img(5391330), img(31739732), img(34414306), img(31969428), img(32216145),
      img(36737766, v.portrait), img(34414306, v.wide),
    ],
    gallery: [
      img(5391330), img(31739732), img(34414306), img(31969428),
      img(32216145), img(36737766, v.portrait), img(34414306, v.wide),
    ],
    details: {
      history:
        "Built by the Chandela dynasty between 950-1050 CE. Originally 85 temples spread over 20 sq km — 22 survive after centuries of jungle reclamation. 'Rediscovered' in 1838 by British engineer T.S. Burt.",
      architecture:
        "Nagara-style temples on raised platforms, with curvilinear shikharas built up of miniature replicas (urushringas) that 'rise like a mountain range'. Sandstone walls are carved with three bands of sculpture: gods, dancers and mithunas (erotic couples).",
      highlights: [
        "Kandariya Mahadev — tallest temple at 31m, most ornate",
        "Lakshmana Temple — earliest, with intact frieze panels",
        "Chaturbhuj Temple — only one with no erotic sculpture",
        "Annual Khajuraho Dance Festival in February",
      ],
      bestTime: "October to March.",
      howToReach: "Direct flights from Delhi and Varanasi.",
    },
  },
  {
    id: "elephanta",
    name: "Elephanta Caves",
    place: "Mumbai Harbour",
    year: "1987",
    type: "Cultural",
    tagline: "Trimurti in basalt",
    description:
      "Rock-cut Shaiva caves on an island. The 6m Mahesamurti — three-faced Shiva — emerges from the rock in cosmic stillness.",
    images: [
      img(31912391), // BG
      img(32325840), img(31912390), img(31912392), img(36098238), img(36098246),
      img(31912391, v.portrait), img(32325840, v.wide),
    ],
    gallery: [
      img(32325840), img(31912390), img(31912392), img(36098238),
      img(36098246), img(31912391, v.portrait), img(32325840, v.wide),
    ],
    details: {
      history:
        "Carved 5th-7th century CE, probably under the Kalachuri or Konkan Mauryas. Named 'Elephanta' by the Portuguese after a stone elephant on the shore (now in Mumbai's museum). Used for target practice by Portuguese troops — much damage from that period.",
      architecture:
        "Seven caves cut from solid basalt, dominated by Cave 1 — a 39m square mandapa with massive pillars and three entrances. The main shrine is a Shiva linga; the western wall holds the Mahesamurti.",
      highlights: [
        "Mahesamurti — 6m three-headed Shiva: creator, preserver, destroyer",
        "Nataraja relief — Shiva as cosmic dancer",
        "Ardhanarishvara — half-male, half-female form of Shiva",
        "Ferry ride from Gateway of India",
      ],
      bestTime: "November to February. Closed Mondays.",
      howToReach: "1-hr ferry from Gateway of India, Mumbai.",
    },
  },
  {
    id: "chola",
    name: "Great Living Chola Temples",
    place: "Tamil Nadu",
    year: "1987",
    type: "Cultural",
    tagline: "Vimanas that touch the sky",
    description:
      "Brihadisvara at Thanjavur, Gangaikondacholapuram and Airavatesvara — peak of Chola architecture (11th-12th c).",
    images: [
      img(27926507), // BG
      img(14721494), img(14721496), img(18320349), img(28656056), img(5273412),
      img(27926507, v.portrait), img(14721496, v.wide),
    ],
    gallery: [
      img(14721494), img(14721496), img(18320349), img(28656056),
      img(5273412), img(27926507, v.portrait), img(14721496, v.wide),
    ],
    details: {
      history:
        "Built by Cholas at the height of their power (985-1250 CE). Brihadisvara was completed in 1010 by Rajaraja I; Gangaikondacholapuram by his son Rajendra I to celebrate his conquest up to the Ganges; Airavatesvara by Rajaraja II in the 12th century.",
      architecture:
        "Brihadisvara's vimana rises 66m — among the tallest of its time. Its capstone (kumbam) weighs 80 tonnes and was hauled up a 6km ramp. Granite walls are covered with inscriptions detailing every donor and dancer's name.",
      highlights: [
        "Brihadisvara — 80-tonne stone dome that casts no shadow at noon",
        "Bronze Nataraja sculptures inside",
        "Airavatesvara — wheels carved on its base",
        "Frescos of Rajaraja I and his guru",
      ],
      bestTime: "October to March.",
      howToReach: "Thanjavur is the main hub; Gangaikondacholapuram 70km north.",
    },
  },
  {
    id: "pattadakal",
    name: "Pattadakal",
    place: "Karnataka",
    year: "1987",
    type: "Cultural",
    tagline: "Where Chalukyas crowned kings",
    description:
      "8th-century ensemble where Nagara (north) and Dravida (south) temple styles meet on the banks of the Malaprabha.",
    images: [
      img(31969428), // BG
      img(32216145), img(34414306), img(27926507), img(28656056), img(18320349),
      img(31969428, v.portrait), img(32216145, v.wide),
    ],
    gallery: [
      img(32216145), img(34414306), img(27926507), img(28656056),
      img(18320349), img(31969428, v.portrait), img(32216145, v.wide),
    ],
    details: {
      history:
        "Capital and coronation site of the Chalukyas of Badami (7th-8th c). Their queens commissioned temples to mark royal victories — Virupaksha (740 CE) commemorates the defeat of the Pallavas.",
      architecture:
        "Nine temples and a Jain sanctuary in two styles: Dravida (Virupaksha, Mallikarjuna) modelled on the Pallava Kailasanathar at Kanchi, and Nagara (Galaganatha, Kashivishvanatha) like northern shikharas. The first known experiments in synthesising the two.",
      highlights: [
        "Virupaksha Temple — inspiration for Ellora's Kailasa",
        "Papanatha Temple — proto-Vesara style",
        "Sangameshvara — earliest, built by Vijayaditya",
        "Carved Ramayana, Mahabharata and Panchatantra friezes",
      ],
      bestTime: "October to February.",
      howToReach: "22km from Badami; combine with Aihole and Badami.",
    },
  },
  {
    id: "sundarbans",
    name: "Sundarbans National Park",
    place: "West Bengal",
    year: "1987",
    type: "Natural",
    tagline: "Mangrove maze of the Bengal tiger",
    description:
      "World's largest mangrove forest. Tigers here have learned to swim and the tides reshape the islands daily.",
    images: [
      img(29290592), // BG
      img(34991637), img(27021800), img(36530920), img(12000869), img(36530918),
      img(29290592, v.portrait), img(34991637, v.wide),
    ],
    gallery: [
      img(34991637), img(27021800), img(36530920), img(12000869),
      img(36530918), img(29290592, v.portrait), img(34991637, v.wide),
    ],
    details: {
      history:
        "The Sundarbans (literally 'beautiful forest', after sundari trees) span 10,000 sq km across India and Bangladesh, with 4,200 sq km in India. Declared a tiger reserve in 1973, World Heritage in 1987. Honey collectors and fishermen wear masks on the back of their heads — tigers attack from behind.",
      architecture:
        "A labyrinth of tidal waterways, mudflats and small islands of mangrove. Constantly reshaped by Bay of Bengal tides. Mangroves have pneumatophores (breathing roots) and viviparous seeds.",
      highlights: [
        "World's only mangrove tigers — strong swimmers, partly aquatic",
        "Estuarine crocodiles, Ganges river dolphins",
        "Spotted deer, wild boar, rhesus macaques",
        "Boat safaris from Sajnekhali or Gosaba",
      ],
      bestTime: "November to February.",
      howToReach: "100km from Kolkata to Godkhali, then boat.",
    },
  },
  {
    id: "nanda-devi",
    name: "Nanda Devi & Valley of Flowers",
    place: "Uttarakhand",
    year: "1988",
    type: "Natural",
    tagline: "Alpine meadows in bloom",
    description:
      "Two adjoining national parks in the Garhwal Himalaya — 600+ endemic alpine flowers carpet the valley each monsoon.",
    images: [
      img(13586931), // BG
      img(12311221), img(14229957), img(34991637), img(29290592),
      img(13586931, v.portrait), img(12311221, v.wide),
    ],
    gallery: [
      img(12311221), img(14229957), img(34991637), img(29290592),
      img(13586931, v.portrait), img(12311221, v.wide),
    ],
    details: {
      history:
        "Nanda Devi (7,816m) is India's second highest peak, sacred to the goddess Nanda. Valley of Flowers was 'discovered' in 1931 by mountaineer Frank Smythe. The two parks were merged into a Biosphere Reserve in 1988.",
      architecture:
        "630 sq km of alpine and subalpine forests, meadows and the inner sanctuary of Nanda Devi — a glacier-fed basin closed to mountaineering since 1983 to allow ecological recovery.",
      highlights: [
        "600+ flowering species: Brahma Kamal, blue poppy, cobra lily",
        "Snow leopard, Asiatic black bear, musk deer",
        "Trek from Govindghat via Ghangaria",
        "Hemkund Sahib — Sikh pilgrimage lake at 4,329m",
      ],
      bestTime: "July to mid-September (Valley of Flowers in bloom).",
      howToReach: "Drive from Rishikesh to Govindghat (270km), then trek.",
    },
  },
  {
    id: "sanchi",
    name: "Buddhist Monuments at Sanchi",
    place: "Madhya Pradesh",
    year: "1989",
    type: "Cultural",
    tagline: "The Great Stupa of Ashoka",
    description:
      "The oldest stone structures in India. The Great Stupa, with its four sculpted toranas, marks the spread of Buddhism under Ashoka.",
    images: [
      img(36588603), // BG
      img(36832404), img(36588505), img(35272924), img(32667758), img(10782177),
      img(36588603, v.portrait), img(36832404, v.wide),
    ],
    gallery: [
      img(36832404), img(36588505), img(35272924), img(32667758),
      img(10782177), img(36588603, v.portrait), img(36832404, v.wide),
    ],
    details: {
      history:
        "Founded by Emperor Ashoka in the 3rd century BCE on a hilltop near his queen Devi's hometown. Continuously enlarged for 1,500 years. Hidden by jungle until 1818, when General Taylor rediscovered them.",
      architecture:
        "Great Stupa is a 16m hemispherical dome of brick faced with stone, surrounded by a vedika (railing) and four toranas (gateways) carved with Jataka tales. The Buddha is never depicted — only by symbols: the bodhi tree, footprints, parasol, empty throne.",
      highlights: [
        "Four toranas — vine motifs, elephants, yakshis on brackets",
        "Ashokan pillar with the famous four-lion capital",
        "Temple 17 — earliest free-standing stone temple in India (5th c.)",
        "Monastery ruins and Bodhisattva sculptures",
      ],
      bestTime: "October to March.",
      howToReach: "46km from Bhopal; nearest railhead Vidisha 10km.",
    },
  },
  {
    id: "humayun",
    name: "Humayun's Tomb",
    place: "Delhi",
    year: "1993",
    type: "Cultural",
    tagline: "The blueprint for the Taj",
    description:
      "First garden-tomb on the subcontinent. Persian-Mughal synthesis of red sandstone and white marble in a four-square charbagh.",
    images: [
      img(12757211), // BG
      img(19966858), img(16931338), img(4799157), img(11948442), img(33705809),
      img(12757211, v.portrait), img(19966858, v.wide),
    ],
    gallery: [
      img(19966858), img(16931338), img(4799157), img(11948442),
      img(33705809), img(12757211, v.portrait), img(19966858, v.wide),
    ],
    details: {
      history:
        "Commissioned in 1565 by Haji Begum, the senior widow of Emperor Humayun, nine years after his death. Designed by Persian architect Mirak Mirza Ghiyas. Bahadur Shah Zafar, the last Mughal emperor, was captured here in 1857.",
      architecture:
        "First monumental tomb in the subcontinent set within a charbagh (four-quartered) Persian garden, divided by water channels. The 47m dome — a true double dome — and the use of red sandstone with white marble inlay set the template for the Taj Mahal 80 years later.",
      highlights: [
        "Charbagh garden split into 36 squares by walkways",
        "Symmetrical from every angle — pioneer of Mughal style",
        "Isa Khan's octagonal tomb in the same complex",
        "Stunning recently restored sandstone inlay",
      ],
      bestTime: "October to March.",
      howToReach: "Heart of Delhi. Metro: JLN Stadium / Khan Market.",
    },
  },
  {
    id: "qutub",
    name: "Qutub Minar Complex",
    place: "Delhi",
    year: "1993",
    type: "Cultural",
    tagline: "Victory written in stone",
    description:
      "73m fluted minaret begun by Qutb-ud-din Aibak in 1193. The complex includes the rust-resistant Iron Pillar from the 4th century.",
    images: [
      img(16892575), // BG
      img(16892484), img(20045166), img(5238224), img(20045038), img(16892562),
      img(16892575, v.portrait), img(20045166, v.wide),
    ],
    gallery: [
      img(16892484), img(20045166), img(5238224), img(20045038),
      img(16892562), img(16892575, v.portrait), img(20045166, v.wide),
    ],
    details: {
      history:
        "Begun by Qutb-ud-din Aibak in 1193 to celebrate the establishment of the Delhi Sultanate. Completed by his successor Iltutmish. Top storeys rebuilt after lightning strikes (1326 and 1368). Fifth storey added by Firoz Shah Tughlaq.",
      architecture:
        "73m of red and buff sandstone with marble accents, tapering from 14m to 2.7m at the top. Five storeys, each marked by a projecting balcony on muqarnas (honeycomb) brackets. Quranic inscriptions and arabesques cover the surface.",
      highlights: [
        "Iron Pillar — 7m, 6 tonnes, 99% pure iron, no rust in 1,600 years",
        "Quwwat-ul-Islam Mosque — first mosque in Delhi, built reusing temple columns",
        "Alai Darwaza (1311) — first true dome and arch in India",
        "Tomb of Iltutmish — exquisite carved interior",
      ],
      bestTime: "October to March. Evening light is golden.",
      howToReach: "Metro: Qutub Minar station (Yellow Line).",
    },
  },
  {
    id: "darjeeling",
    name: "Mountain Railways of India",
    place: "Darjeeling • Nilgiri • Kalka",
    year: "1999",
    type: "Cultural",
    tagline: "Steam through the clouds",
    description:
      "Three narrow-gauge engineering marvels traversing the Himalayas and Nilgiris with loops, zigzags and Z-reverses.",
    images: [
      img(3878609), // BG
      img(31180796), img(3565257), img(13586931), img(12311221), img(14229957),
      img(3878609, v.portrait), img(31180796, v.wide),
    ],
    gallery: [
      img(31180796), img(3565257), img(13586931), img(12311221),
      img(14229957), img(3878609, v.portrait), img(31180796, v.wide),
    ],
    details: {
      history:
        "Darjeeling Himalayan Railway opened 1881 (2-foot gauge), inscribed in 1999. Nilgiri Mountain Railway (1908) added 2005 with its rack-and-pinion system. Kalka-Shimla Railway (1903) added 2008 — 102 tunnels and 864 bridges in 96km.",
      architecture:
        "Three different feats of British colonial engineering. DHR uses six Z-reverses and three loops including the famous Batasia Loop. NMR is the steepest rack railway in Asia. KSR's tunnels include the 1.14km Barog tunnel.",
      highlights: [
        "DHR — toy train from Ghum (India's highest railway station)",
        "Steam locomotives still in regular service",
        "Batasia Loop with Kanchenjunga in view",
        "NMR — climbs 326m per km using the Abt system",
      ],
      bestTime: "March to May, September to November.",
      howToReach: "DHR from New Jalpaiguri; KSR from Kalka; NMR from Mettupalayam.",
    },
  },
  {
    id: "mahabodhi",
    name: "Mahabodhi Temple",
    place: "Bodh Gaya, Bihar",
    year: "2002",
    type: "Cultural",
    tagline: "Where the Buddha awakened",
    description:
      "Marking the spot of enlightenment under the Bodhi tree. The 50m tower is one of the earliest brick temples still standing.",
    images: [
      img(10782177), // BG
      img(35272924), img(32667758), img(36588603), img(36832404), img(36588505),
      img(10782177, v.portrait), img(35272924, v.wide),
    ],
    gallery: [
      img(35272924), img(32667758), img(36588603), img(36832404),
      img(36588505), img(10782177, v.portrait), img(35272924, v.wide),
    ],
    details: {
      history:
        "Site where Prince Siddhartha attained enlightenment around 528 BCE. First shrine built by Emperor Ashoka in 3rd c. BCE; present temple is largely 5th-6th c. CE, restored by the British in the 1880s. The Bodhi tree itself is a fifth-generation descendant of the original.",
      architecture:
        "50m tower in the rare pyramidal sikhara style — straight-sided, not curvilinear. Built of brick faced with plaster, covered in niches with Buddha images. One of the few surviving examples of Gupta-era brick architecture.",
      highlights: [
        "The Mahabodhi tree (Ficus religiosa)",
        "Vajrasana — the diamond throne where Buddha sat",
        "Animesha Lochana stupa — where Buddha gazed unblinking",
        "Pilgrimage centre for Buddhists worldwide",
      ],
      bestTime: "October to March.",
      howToReach: "12km from Gaya railway station / airport.",
    },
  },
  {
    id: "bhimbetka",
    name: "Rock Shelters of Bhimbetka",
    place: "Madhya Pradesh",
    year: "2003",
    type: "Cultural",
    tagline: "30,000-year-old galleries",
    description:
      "Quartzite rock shelters with prehistoric paintings of hunters, dancers and animals — one of the oldest art records of humanity.",
    images: [
      img(35712457), // BG
      img(32142489), img(36098246), img(31912390), img(31912391), img(31912392),
      img(35712457, v.portrait), img(32142489, v.wide),
    ],
    gallery: [
      img(32142489), img(36098246), img(31912390), img(31912391),
      img(31912392), img(35712457, v.portrait), img(32142489, v.wide),
    ],
    details: {
      history:
        "Discovered in 1957 by archaeologist V.S. Wakankar. Continuously inhabited from the Paleolithic to the medieval period — 100,000+ years of human presence. 750+ rock shelters spread over 10km of sandstone outcrops.",
      architecture:
        "Natural quartzite shelters with rock-art in seven layers: Upper Palaeolithic (white animals), Mesolithic (red hunters), Chalcolithic (early agriculture), Early Historic (Yakshas), Medieval (geometric).",
      highlights: [
        "Zoo Rock — 252 animals in a single panel",
        "Boar Rock — gigantic mythical boar attacking a man",
        "Hand prints and dancing figures",
        "Bhima's chair (Bhimbet-ka) of folk legend",
      ],
      bestTime: "October to March.",
      howToReach: "45km south of Bhopal off NH-46.",
    },
  },
  {
    id: "champaner",
    name: "Champaner-Pavagadh",
    place: "Gujarat",
    year: "2004",
    type: "Cultural",
    tagline: "A 16th-century pre-Mughal city",
    description:
      "Hindu-Muslim architecture, mosques, tombs, stepwells and a hilltop Kalika Mata shrine, surrounded by Chalcolithic sites.",
    images: [
      img(34952270), // BG
      img(27814820), img(3844593), img(19149618), img(33705809), img(15371756),
      img(34952270, v.portrait), img(27814820, v.wide),
    ],
    gallery: [
      img(27814820), img(3844593), img(19149618), img(33705809),
      img(15371756), img(34952270, v.portrait), img(27814820, v.wide),
    ],
    details: {
      history:
        "Pavagadh hilltop fort dates to the 8th c. Sultan Mahmud Begada captured it in 1484 and built Champaner below, making it his capital. The city was sacked by Humayun in 1535 and abandoned. The only complete pre-Mughal Islamic city to survive.",
      architecture:
        "Synthesis of Sultanate Islamic and Hindu Solanki styles — mosques borrow temple ornamentation, including pillared courtyards and ribbed domes. Jami Masjid (1513) is the masterpiece.",
      highlights: [
        "Jami Masjid — 172 pillars, twin minarets",
        "Kevda Masjid & Nagina Masjid",
        "Kalika Mata temple atop Pavagadh hill (800m)",
        "Helical stepwell at Champaner",
      ],
      bestTime: "November to February.",
      howToReach: "50km from Vadodara.",
    },
  },
  {
    id: "cst",
    name: "Chhatrapati Shivaji Terminus",
    place: "Mumbai",
    year: "2004",
    type: "Cultural",
    tagline: "Victorian Gothic on the Arabian Sea",
    description:
      "F.W. Stevens' 1888 station fusing Victorian Italianate Gothic with Indian traditional palace motifs — still a working terminus.",
    images: [
      img(28867943), // BG
      img(28867947), img(28867945), img(15371756), img(21363831), img(11438923),
      img(28867943, v.portrait), img(28867945, v.wide),
    ],
    gallery: [
      img(28867947), img(28867945), img(15371756), img(21363831),
      img(11438923), img(28867943, v.portrait), img(28867945, v.wide),
    ],
    details: {
      history:
        "Designed by Frederick William Stevens in 1878, completed 1888 to commemorate Queen Victoria's Golden Jubilee — then named Victoria Terminus. Renamed Chhatrapati Shivaji Terminus in 1996. Headquarters of Central Railway. 3 million passengers daily.",
      architecture:
        "Victorian Italianate Gothic with Indian elements — domes, turrets, pointed arches, eccentric ground plan. Central dome ribbed in iron — first such use in India. Sculpture of 'Progress' atop the dome; lions of England and tigers of India flank the gates.",
      highlights: [
        "Gargoyles modelled on Indian birds and animals",
        "Stained-glass windows showing peacocks and engines",
        "Star-vaulted booking hall — Italian marble",
        "Featured in Slumdog Millionaire's dance finale",
      ],
      bestTime: "October to February. Avoid peak commuter hours.",
      howToReach: "Heart of South Mumbai. Walk from Fort or Marine Drive.",
    },
  },
  {
    id: "red-fort",
    name: "Red Fort Complex",
    place: "Delhi",
    year: "2007",
    type: "Cultural",
    tagline: "Shah Jahan's citadel",
    description:
      "Apex of Mughal creativity under Shah Jahan. The Lahori Gate hosts India's Independence Day address each August 15.",
    images: [
      img(4799157), // BG
      img(33705809), img(19149618), img(3844593), img(11948442), img(12757211),
      img(4799157, v.portrait), img(33705809, v.wide),
    ],
    gallery: [
      img(33705809), img(19149618), img(3844593), img(11948442),
      img(12757211), img(4799157, v.portrait), img(33705809, v.wide),
    ],
    details: {
      history:
        "Built 1638-1648 by Shah Jahan when he moved the capital from Agra to Shahjahanabad (Old Delhi). Looted by Nadir Shah in 1739 (the Peacock Throne and Koh-i-Noor diamond). British demolished many pavilions after the 1857 uprising.",
      architecture:
        "Octagonal walls of red sandstone enclosing 254 acres. White marble pavilions inside line a central canal — the 'Nahr-i-Behisht' or Stream of Paradise. Combines Persian, Timurid and Hindu architectural traditions.",
      highlights: [
        "Lahori Gate — site of Independence Day flag hoisting",
        "Diwan-i-Khas — engraved 'If there is paradise on earth, it is this'",
        "Moti Masjid — Aurangzeb's private pearl mosque",
        "Rang Mahal & Khas Mahal — imperial residences",
      ],
      bestTime: "October to March. Closed Mondays.",
      howToReach: "Metro: Lal Qila / Chandni Chowk.",
    },
  },
  {
    id: "jantar",
    name: "Jantar Mantar",
    place: "Jaipur",
    year: "2010",
    type: "Cultural",
    tagline: "Stone instruments to read the sky",
    description:
      "Sawai Jai Singh II's 18th-century astronomical observatory — masonry instruments still measure time to a 2-second accuracy.",
    images: [
      img(30358327), // BG
      img(18408973), img(12290473), img(16892484), img(20045038), img(20045166),
      img(30358327, v.portrait), img(18408973, v.wide),
    ],
    gallery: [
      img(18408973), img(12290473), img(16892484), img(20045038),
      img(20045166), img(30358327, v.portrait), img(18408973, v.wide),
    ],
    details: {
      history:
        "Built by Maharaja Sawai Jai Singh II between 1727-1734. One of five Jantar Mantars he built (Jaipur, Delhi, Varanasi, Ujjain, Mathura). The Jaipur one is the largest and best preserved.",
      architecture:
        "19 instruments of masonry, stone and brass — each designed for a specific astronomical task: measuring time, predicting eclipses, tracking stars, determining declinations. The Samrat Yantra (Supreme Instrument) is the world's largest stone sundial.",
      highlights: [
        "Samrat Yantra — 27m sundial accurate to 2 seconds",
        "Jai Prakash Yantra — bowl-shaped sky map",
        "Rama Yantra — measures altitude/azimuth",
        "12 Rashivalaya Yantras — one per zodiac sign",
      ],
      bestTime: "October to March.",
      howToReach: "Heart of Jaipur, adjacent to City Palace.",
    },
  },
  {
    id: "ghats",
    name: "Western Ghats",
    place: "6 States",
    year: "2012",
    type: "Natural",
    tagline: "Older than the Himalayas",
    description:
      "39 serial properties protecting one of the world's eight biodiversity hotspots — shola forests, monsoon clouds and endemic species.",
    images: [
      img(12311221), // BG
      img(13586931), img(14229957), img(29290592), img(34991637), img(27021800),
      img(12311221, v.portrait), img(13586931, v.wide),
    ],
    gallery: [
      img(13586931), img(14229957), img(29290592), img(34991637),
      img(27021800), img(12311221, v.portrait), img(13586931, v.wide),
    ],
    details: {
      history:
        "1,600 km mountain chain along India's west coast, from Gujarat to Kerala. Older than the Himalayas, formed when Madagascar broke from India 150 mya. 39 properties inscribed in 2012 across Maharashtra, Goa, Karnataka, Kerala, Tamil Nadu.",
      architecture:
        "Diverse landscapes — evergreen rainforests, shola-grasslands, montane wet forests. Influences the Indian monsoon by intercepting moisture-laden winds. Home to 7,402 flowering plants, 1,814 non-flowering, 139 mammals, 508 birds, 179 amphibians.",
      highlights: [
        "Nilgiri tahr, lion-tailed macaque, Malabar civet",
        "Endemic genera: Anamalai cycad, Nilgiri laughingthrush",
        "Source of Godavari, Krishna, Kaveri rivers",
        "Tea, coffee, cardamom & pepper plantations",
      ],
      bestTime: "October to March (after monsoon).",
      howToReach: "Hubs: Munnar, Coorg, Wayanad, Lonavala, Mahabaleshwar.",
    },
  },
  {
    id: "hill-forts",
    name: "Hill Forts of Rajasthan",
    place: "Rajasthan",
    year: "2013",
    type: "Cultural",
    tagline: "Six citadels of the Rajputs",
    description:
      "Chittorgarh, Kumbhalgarh, Ranthambore, Gagron, Amber and Jaisalmer — Aravalli forts of stone, palaces and stepped reservoirs.",
    images: [
      img(14229957), // BG
      img(12311221), img(28656056), img(13586931), img(18320349), img(34952270),
      img(14229957, v.portrait), img(28656056, v.wide),
    ],
    gallery: [
      img(12311221), img(28656056), img(13586931), img(18320349),
      img(34952270), img(14229957, v.portrait), img(28656056, v.wide),
    ],
    details: {
      history:
        "Six Rajput strongholds spanning the 8th-19th centuries: Chittorgarh, Kumbhalgarh, Ranthambore, Gagron, Amber and Jaisalmer. Each adapted to its setting — Aravalli hill, water source, dense forest or desert.",
      architecture:
        "Massive defensive walls follow ridgelines. Inside: palaces, temples, urban quarters, water-harvesting systems (jal mahal, baori). Kumbhalgarh has the second-longest continuous wall in the world (36km).",
      highlights: [
        "Chittorgarh — Jauhar of Rani Padmini, Vijaya Stambha",
        "Kumbhalgarh — wall visible from space",
        "Jaisalmer — only 'living' fort, still inhabited",
        "Amber — mirror palace, elephant rides",
      ],
      bestTime: "October to March.",
      howToReach: "Hubs: Udaipur, Jodhpur, Jaipur, Jaisalmer.",
    },
  },
  {
    id: "rani-ki-vav",
    name: "Rani-ki-Vav",
    place: "Patan, Gujarat",
    year: "2014",
    type: "Cultural",
    tagline: "An inverted temple to water",
    description:
      "Queen Udayamati's 11th-century stepwell descends seven storeys, lined with 500+ sculptures of Vishnu's avatars and apsaras.",
    images: [
      img(14721494), // BG
      img(14721496), img(34414306), img(27926507), img(28656056), img(18320349),
      img(14721494, v.portrait), img(34414306, v.wide),
    ],
    gallery: [
      img(14721496), img(34414306), img(27926507), img(28656056),
      img(18320349), img(14721494, v.portrait), img(34414306, v.wide),
    ],
    details: {
      history:
        "Commissioned by Queen Udayamati in 1063 as a memorial to her husband, King Bhimdev I of the Chaulukya dynasty. Silted up by the Saraswati river floods soon after; rediscovered and excavated by the ASI in the 1980s.",
      architecture:
        "7 storeys, 64m long, 20m wide, 27m deep. Maru-Gurjara style. Inverted temple form, with the well shaft as the sanctum. Over 500 main sculptures and 1,000 minor figures — Dashavatara of Vishnu, nag-kanyas, apsaras in 16 expressions of beauty (Solah Shringar).",
      highlights: [
        "Featured on India's ₹100 note",
        "Sheshashayi Vishnu reclining on Sheshanaga",
        "Apsaras applying lipstick, holding mirrors",
        "Underground tunnel reportedly connecting to Sidhpur",
      ],
      bestTime: "October to February.",
      howToReach: "125km from Ahmedabad.",
    },
  },
  {
    id: "nalanda",
    name: "Nalanda Mahavihara",
    place: "Bihar",
    year: "2016",
    type: "Cultural",
    tagline: "The ancient world's great university",
    description:
      "From 5th-13th c. CE, Nalanda taught 10,000 monks from across Asia — its red-brick mounds preserve stupas and viharas.",
    images: [
      img(35638213), // BG
      img(35638212), img(36947046), img(36588603), img(36832404), img(36588505),
      img(35638213, v.portrait), img(35638212, v.wide),
    ],
    gallery: [
      img(35638212), img(36947046), img(36588603), img(36832404),
      img(36588505), img(35638213, v.portrait), img(35638212, v.wide),
    ],
    details: {
      history:
        "Founded by Kumaragupta I (415-455 CE), flourished under the Palas. At its peak, 10,000 students and 2,000 teachers in subjects from Buddhist scripture to mathematics, astronomy, medicine. Destroyed by Bakhtiyar Khilji's army around 1200 — books burned for three months.",
      architecture:
        "Brick monastery-university covering 14 hectares. 8 large compounds, 10 temples and many shrines, with classrooms, dormitories and libraries (the famous Dharma Gunj — Mountain of Truth). The Sariputra Stupa is the tallest surviving structure.",
      highlights: [
        "Chronicled by Chinese monks Xuanzang & Yijing",
        "Sariputra Stupa — 31m tall, votive shrines on all sides",
        "Excavated viharas with monk cells",
        "Adjacent Nalanda Museum — exquisite bronzes",
      ],
      bestTime: "October to March.",
      howToReach: "90km from Patna; nearest railhead Rajgir.",
    },
  },
  {
    id: "khangchendzonga",
    name: "Khangchendzonga National Park",
    place: "Sikkim",
    year: "2016",
    type: "Mixed",
    tagline: "The third highest peak, sacred",
    description:
      "India's only mixed Heritage site — alpine glaciers, sacred Buddhist landscapes and the home mountain of the Lepcha people.",
    images: [
      img(13586931), // BG
      img(12311221), img(14229957), img(36530920), img(36530918), img(34991637),
      img(13586931, v.portrait), img(12311221, v.wide),
    ],
    gallery: [
      img(12311221), img(14229957), img(36530920), img(36530918),
      img(34991637), img(13586931, v.portrait), img(12311221, v.wide),
    ],
    details: {
      history:
        "Khangchendzonga (8,586m) is the world's third highest mountain and the guardian deity of Sikkim. Climbers traditionally stop a few metres below the summit out of respect. The park was inscribed in 2016 — India's first Mixed Heritage Site.",
      architecture:
        "1,784 sq km of glaciers, lakes, alpine meadows and dense forest. Includes a part of the world's highest ecosystem. Home to snow leopard, red panda, musk deer and Himalayan tahr.",
      highlights: [
        "Sacred for Buddhists, Lepchas and Bhutia people",
        "Goecha La trek for the Kanchenjunga sunrise",
        "Yumthang Valley of Flowers in summer",
        "Permits required for foreign visitors",
      ],
      bestTime: "March to May, October to November.",
      howToReach: "Gangtok is the gateway; trek from Yuksom.",
    },
  },
  {
    id: "ahmedabad",
    name: "Historic City of Ahmedabad",
    place: "Gujarat",
    year: "2017",
    type: "Cultural",
    tagline: "Pols, mosques and Sufi shrines",
    description:
      "Walled city of Sultanate-era mosques, Hindu and Jain temples, and gated 'pol' neighbourhoods with carved wooden havelis.",
    images: [
      img(15371756), // BG
      img(21363831), img(34952270), img(27814820), img(3844593), img(19149618),
      img(15371756, v.portrait), img(21363831, v.wide),
    ],
    gallery: [
      img(21363831), img(34952270), img(27814820), img(3844593),
      img(19149618), img(15371756, v.portrait), img(21363831, v.wide),
    ],
    details: {
      history:
        "Founded in 1411 by Sultan Ahmad Shah on the east bank of the Sabarmati. Capital of the Gujarat Sultanate. First Indian city to receive UNESCO World Heritage City status (2017). Mahatma Gandhi launched the Dandi March from Sabarmati Ashram in 1930.",
      architecture:
        "A walled 5.4 sq km old city of 600+ pols — gated residential clusters built for security and community. Indo-Saracenic mosques, intricately carved wooden havelis, swayambhu temples and Sufi dargahs. Jali (stone lattice) windows are signature.",
      highlights: [
        "Jama Masjid (1424) — yellow sandstone, 260 columns",
        "Sidi Saiyyed Mosque — 'Tree of Life' jali screens",
        "Heritage walk through pols with secret passages",
        "Adalaj Stepwell nearby",
      ],
      bestTime: "November to February.",
      howToReach: "Direct flights/trains to Ahmedabad.",
    },
  },
  {
    id: "mumbai-deco",
    name: "Victorian Gothic & Art Deco Mumbai",
    place: "Mumbai",
    year: "2018",
    type: "Cultural",
    tagline: "Two centuries on one street",
    description:
      "Fort precinct's Gothic Revival public buildings face Marine Drive's curve of pastel Art Deco apartments — the largest such ensemble outside Miami.",
    images: [
      img(28867943), // BG
      img(28867947), img(28867945), img(15371756), img(21363831), img(11438923),
      img(28867943, v.portrait), img(28867945, v.wide),
    ],
    gallery: [
      img(28867947), img(28867945), img(15371756), img(21363831),
      img(11438923), img(28867943, v.portrait), img(28867945, v.wide),
    ],
    details: {
      history:
        "19th-century reclamation projects turned seven islands into a single Bombay. Victorian Gothic public buildings (1860s-90s) face the Oval Maidan; in the 1930s, the Backbay Reclamation produced Marine Drive's Art Deco frontage. The juxtaposition is unique globally.",
      architecture:
        "Victorian Gothic uses pointed arches, gargoyles, polychrome stone — adapted with Indian motifs (peacocks, monkeys, lotus). Art Deco uses streamlined curves, vertical fins, ziggurat parapets, nautical motifs — local twists include 'Bombay Deco' tropical foliage.",
      highlights: [
        "Bombay High Court, Mumbai University, Rajabai Tower",
        "Eros, Regal & Liberty cinemas — Deco gems",
        "Marine Drive's 'Queen's Necklace' at night",
        "Walking tours by Khaki Tours",
      ],
      bestTime: "October to February.",
      howToReach: "Walk from Churchgate or CST station.",
    },
  },
  {
    id: "jaipur",
    name: "Jaipur, the Pink City",
    place: "Rajasthan",
    year: "2019",
    type: "Cultural",
    tagline: "A city planned by the stars",
    description:
      "Sawai Jai Singh II's 1727 grid plan based on Vastu Shastra. Pink-washed in 1876 to welcome the Prince of Wales.",
    images: [
      img(16892484), // BG
      img(20045038), img(30358327), img(16892575), img(20045166), img(16892562),
      img(16892484, v.portrait), img(30358327, v.wide),
    ],
    gallery: [
      img(20045038), img(30358327), img(16892575), img(20045166),
      img(16892562), img(16892484, v.portrait), img(30358327, v.wide),
    ],
    details: {
      history:
        "Founded in 1727 by Maharaja Sawai Jai Singh II of the Kachhwaha Rajputs — the first planned city in Mughal-era India. Designed by Brahmin scholar Vidyadhar Bhattacharya based on the Vastu Shilpa Shastra grid of nine squares.",
      architecture:
        "Nine rectangular sectors (chowkris), bisected by 34m wide bazaars. Single-storey shops with uniform jharokhas (overhanging balconies) and chajjas (eaves). Pink-painted in 1876 — colour of hospitality — for the Prince of Wales' visit, kept ever since by law.",
      highlights: [
        "Hawa Mahal — 953 latticed windows for harem women to watch processions",
        "City Palace and Chandra Mahal",
        "Jantar Mantar observatory",
        "Amber Fort overlooking Maota Lake",
      ],
      bestTime: "October to March.",
      howToReach: "Direct flights, trains and highways from Delhi (260km).",
    },
  },
  {
    id: "dholavira",
    name: "Dholavira",
    place: "Kutch, Gujarat",
    year: "2021",
    type: "Cultural",
    tagline: "A Harappan city of reservoirs",
    description:
      "3000-1500 BCE Indus Valley city in the white desert of Kutch. Sixteen reservoirs and a 'signboard' of Indus script survive.",
    images: [
      img(28656056), // BG
      img(35638212), img(14721496), img(35638213), img(36947046), img(18320349),
      img(28656056, v.portrait), img(35638212, v.wide),
    ],
    gallery: [
      img(35638212), img(14721496), img(35638213), img(36947046),
      img(18320349), img(28656056, v.portrait), img(35638212, v.wide),
    ],
    details: {
      history:
        "Inhabited 3000-1500 BCE, one of the five largest Harappan sites and the southernmost. Located on Khadir Bet island in the Rann of Kutch. Discovered in 1967, excavated since 1990 by R.S. Bisht.",
      architecture:
        "Unique tripartite plan: Citadel (Castle + Bailey), Middle Town and Lower Town. 16+ stepped reservoirs covering 17 hectares — most sophisticated water-management of any Bronze Age city. Built of sandstone (not the usual baked brick).",
      highlights: [
        "The 'Dholavira Signboard' — 10 large Indus script signs",
        "Stadium-like ceremonial ground",
        "Stepped reservoirs with drains and channels",
        "Annual Rann Utsav nearby (November-February)",
      ],
      bestTime: "November to February (Rann Utsav season).",
      howToReach: "230km from Bhuj; remote, plan a stay.",
    },
  },
  {
    id: "ramappa",
    name: "Ramappa Temple (Kakatiya)",
    place: "Telangana",
    year: "2021",
    type: "Cultural",
    tagline: "Floating bricks, earthquake-proof",
    description:
      "13th-century Kakatiya temple built on a sandbox foundation, with porous bricks light enough to float on water.",
    images: [
      img(34414306), // BG
      img(31739732), img(36737766), img(5391330), img(31969428), img(32216145),
      img(34414306, v.portrait), img(31739732, v.wide),
    ],
    gallery: [
      img(31739732), img(36737766), img(5391330), img(31969428),
      img(32216145), img(34414306, v.portrait), img(31739732, v.wide),
    ],
    details: {
      history:
        "Commissioned in 1213 CE by Recharla Rudra, general of the Kakatiya king Ganapati Deva. Took 40 years to build. The only temple known by its sculptor's name — Ramappa.",
      architecture:
        "Star-shaped platform with intricate granite, sandstone and basalt sculpture. The shikhara is made of 'floating' light-weight porous bricks — they actually do float. Sandbox foundation absorbs seismic shock — the temple has survived multiple earthquakes.",
      highlights: [
        "Nandi mandapa with a 9-foot Nandi",
        "Madanikas — dancing apsaras under the eaves",
        "Acoustic granite pillars that ring when struck",
        "Surrounded by Ramappa Lake — 800-year-old Kakatiya irrigation",
      ],
      bestTime: "October to March.",
      howToReach: "200km from Hyderabad, near Warangal.",
    },
  },
  {
    id: "santiniketan",
    name: "Santiniketan",
    place: "West Bengal",
    year: "2023",
    type: "Cultural",
    tagline: "Tagore's open-air university",
    description:
      "Founded by the Tagores, a pan-Asian modernist educational landscape where classes are held under the trees.",
    images: [
      img(36947046), // BG
      img(35638213), img(35638212), img(36588603), img(36832404), img(36588505),
      img(36947046, v.portrait), img(35638213, v.wide),
    ],
    gallery: [
      img(35638213), img(35638212), img(36588603), img(36832404),
      img(36588505), img(36947046, v.portrait), img(35638213, v.wide),
    ],
    details: {
      history:
        "Founded as an ashram by Debendranath Tagore in 1863. His son Rabindranath established the Patha Bhavana school here in 1901 and the Visva-Bharati University in 1921. Tagore won the Nobel Prize in Literature in 1913.",
      architecture:
        "Pan-Asian modernist — a deliberate rejection of British colonial styles. Buildings by Surendranath Kar and Nandalal Bose drew on Buddhist, Japanese, Javanese and rural Bengali sources. Classes are conducted under banyan and chhatim trees.",
      highlights: [
        "Uttarayan — Tagore's residential complex",
        "Kala Bhavana — Nandalal Bose's mural-covered art school",
        "Annual Poush Mela & Basanta Utsav (Holi)",
        "Khoai sandstone landscape",
      ],
      bestTime: "October to February. Poush Mela in late December.",
      howToReach: "160km from Kolkata; Bolpur railhead.",
    },
  },
  {
    id: "hoysala",
    name: "Sacred Ensembles of the Hoysalas",
    place: "Karnataka",
    year: "2023",
    type: "Cultural",
    tagline: "Soapstone lathed like jewellery",
    description:
      "Belur, Halebidu and Somanathapura. Star-shaped platforms and lathe-turned pillars carved to micro detail in the 12th-13th c.",
    images: [
      img(34414306), // BG
      img(31739732), img(31969428), img(32216145), img(36737766), img(5391330),
      img(34414306, v.portrait), img(31969428, v.wide),
    ],
    gallery: [
      img(31739732), img(31969428), img(32216145), img(36737766),
      img(5391330), img(34414306, v.portrait), img(31969428, v.wide),
    ],
    details: {
      history:
        "Built by the Hoysala dynasty (10th-14th c.). Chennakeshava Temple at Belur consecrated 1117 CE by King Vishnuvardhana. Hoysaleswara at Halebidu started 1121. Keshava at Somanathapura completed 1268 — the latest and most refined.",
      architecture:
        "Star-shaped plinths (jagati) allow circumambulation. Walls are layered with bands of elephants, lions, horses, scrollwork, scenes from the Puranas, then dancers and gods. Pillars are lathe-turned — perfectly cylindrical with micro-grooves. Carved in soft chloritic soapstone that hardens with exposure.",
      highlights: [
        "Darpana Sundari (mirror beauty) at Belur",
        "Shantala Devi sculpture — queen who danced",
        "82 horizontal bands of sculpture at Halebidu",
        "Each pillar a different design — never repeated",
      ],
      bestTime: "October to March.",
      howToReach: "From Hassan: Belur 35km, Halebidu 30km. Somanathapura near Mysore.",
    },
  },
  {
    id: "moidams",
    name: "Moidams of the Ahom Dynasty",
    place: "Assam",
    year: "2024",
    type: "Cultural",
    tagline: "700-year-old royal mounds",
    description:
      "First cultural Heritage site from Northeast India. Ahom kings buried beneath grass-covered hemispherical mounds in Charaideo.",
    images: [
      img(36947046), // BG
      img(35638212), img(36588505), img(35638213), img(36832404), img(36588603),
      img(36947046, v.portrait), img(35638212, v.wide),
    ],
    gallery: [
      img(35638212), img(36588505), img(35638213), img(36832404),
      img(36588603), img(36947046, v.portrait), img(35638212, v.wide),
    ],
    details: {
      history:
        "The Ahom dynasty ruled Assam for 600 years (1228-1826). Their first capital, Charaideo, was the royal necropolis. 30 royal moidams (mound-burials) survive of an estimated 150. Inscribed in 2024 — the 43rd Indian site and first cultural site from Northeast India.",
      architecture:
        "Each moidam is a hemispherical earthen mound covering a brick vault containing the king, his attendants, weapons, jewellery and even live retainers (early on). Octagonal boundary walls. Tai-Ahom Buddhist-Hindu fusion.",
      highlights: [
        "30 royal mounds spread across Charaideo",
        "Largest mound is 30m wide",
        "Pioneer of unique Tai-Ahom funerary culture",
        "Combine with Sivasagar temples and tanks",
      ],
      bestTime: "October to March.",
      howToReach: "26km from Sivasagar; 360km from Guwahati.",
    },
  },
  {
    id: "maratha",
    name: "Maratha Military Landscapes",
    place: "Maharashtra & Tamil Nadu",
    year: "2025",
    type: "Cultural",
    tagline: "Twelve forts of self-rule",
    description:
      "Raigad, Rajgad, Pratapgad, Shivneri, Gingee and more — Shivaji's network of hill, coastal and island forts.",
    images: [
      img(14229957), // BG
      img(12311221), img(28656056), img(13586931), img(18320349), img(34952270),
      img(14229957, v.portrait), img(28656056, v.wide),
    ],
    gallery: [
      img(12311221), img(28656056), img(13586931), img(18320349),
      img(34952270), img(14229957, v.portrait), img(28656056, v.wide),
    ],
    details: {
      history:
        "Twelve forts of Chhatrapati Shivaji Maharaj's military system (17th-19th c.), inscribed in 2025. Built to defend the Maratha Swarajya (self-rule) against the Mughals, Adil Shahis and the British. Shivneri is Shivaji's birthplace; Raigad his capital and final resting place.",
      architecture:
        "Three categories: hill forts (Shivneri, Lohagad, Raigad), coastal forts (Vijaydurg, Sindhudurg), island forts (Suvarnadurg, Khanderi). Adapted to local terrain — basalt cliffs, basaltic seacoasts, mangrove islands. Guerrilla warfare design with hidden gates and zigzag walls.",
      highlights: [
        "Raigad — the Maratha capital and Shivaji's samadhi",
        "Pratapgad — site of Shivaji's victory over Afzal Khan",
        "Sindhudurg — built on a sea-rock with Shivaji's footprint",
        "Gingee — South India's most impregnable hill fort",
      ],
      bestTime: "October to February.",
      howToReach: "Pune & Mumbai are bases for the Sahyadri forts.",
    },
  },
];
