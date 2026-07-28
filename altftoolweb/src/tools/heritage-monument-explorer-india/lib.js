/**
 * Indian Heritage Monument Explorer — data + query logic.
 *
 * Sources for the reference data: UNESCO World Heritage List entries for India
 * (inscription years as published by the World Heritage Committee) and the
 * Archaeological Survey of India list of Monuments of National Importance.
 * `yearStart` is the conventional start-of-construction year in the Common Era;
 * negative values are BCE. Where a monument was built over generations the
 * commonly cited starting year is used and `builtLabel` gives the full span.
 */

/** Era buckets used across Indian art-history surveys. `from`/`to` are CE years, BCE negative. */
export const ERAS = [
  {
    id: "ancient",
    label: "Ancient (before 600 CE)",
    from: -100000,
    to: 599,
    note: "Prehistoric rock art, Harappan cities, Mauryan stupas and the earliest rock-cut halls.",
  },
  {
    id: "early-medieval",
    label: "Early Medieval (600-1200 CE)",
    from: 600,
    to: 1199,
    note: "The great temple dynasties: Pallava, Chola, Chalukya, Chandela, Solanki, Hoysala.",
  },
  {
    id: "sultanate",
    label: "Sultanate & Regional (1200-1526)",
    from: 1200,
    to: 1525,
    note: "Delhi Sultanate, Vijayanagara, Bahmani and regional sultanate building.",
  },
  {
    id: "mughal",
    label: "Mughal & Early Modern (1526-1757)",
    from: 1526,
    to: 1756,
    note: "Mughal imperial architecture alongside Rajput, Deccan and Nayaka work.",
  },
  {
    id: "colonial",
    label: "Colonial (1757-1947)",
    from: 1757,
    to: 1947,
    note: "Victorian Gothic, Indo-Saracenic and princely-state commissions.",
  },
  {
    id: "modern",
    label: "Modern (after 1947)",
    from: 1948,
    to: 2100,
    note: "Post-independence landmarks, including modernist and revival architecture.",
  },
];

/** Architectural style vocabulary used by the filter. */
export const STYLES = [
  "Prehistoric & Harappan",
  "Buddhist Stupa & Vihara",
  "Rock-cut",
  "Nagara Temple",
  "Dravidian Temple",
  "Kalinga Temple",
  "Vesara & Hoysala",
  "Jain Temple",
  "Stepwell",
  "Indo-Islamic (Sultanate)",
  "Mughal",
  "Deccan Sultanate",
  "Rajput",
  "Nawabi & Awadhi",
  "Sikh",
  "Tibetan Buddhist Monastic",
  "Indo-Saracenic",
  "Colonial & Victorian Gothic",
  "Regional Vernacular",
  "Modernist",
];

/**
 * Curated reference set of Indian heritage monuments.
 * unesco = year of inscription on the UNESCO World Heritage List, or null.
 */
export const MONUMENTS = [
  { name: "Taj Mahal", city: "Agra", state: "Uttar Pradesh", style: "Mughal", type: "Tomb", yearStart: 1632, builtLabel: "1632-1653", patron: "Shah Jahan", unesco: 1983, note: "White-marble mausoleum for Mumtaz Mahal; the high point of Mughal garden-tomb design." },
  { name: "Agra Fort", city: "Agra", state: "Uttar Pradesh", style: "Mughal", type: "Fort", yearStart: 1565, builtLabel: "1565-1573, later additions", patron: "Akbar", unesco: 1983, note: "Red sandstone walled palace-fort; Shah Jahan added the marble Khas Mahal and Diwan-i-Khas." },
  { name: "Fatehpur Sikri", city: "Fatehpur Sikri", state: "Uttar Pradesh", style: "Mughal", type: "Palace city", yearStart: 1571, builtLabel: "1571-1585", patron: "Akbar", unesco: 1986, note: "Short-lived Mughal capital with the Buland Darwaza and the Jama Masjid." },
  { name: "Ajanta Caves", city: "Aurangabad district", state: "Maharashtra", style: "Rock-cut", type: "Cave complex", yearStart: -200, builtLabel: "2nd century BCE - 6th century CE", patron: "Satavahana and Vakataka patrons", unesco: 1983, note: "Thirty Buddhist chaitya halls and viharas famous for their mural painting." },
  { name: "Ellora Caves", city: "Aurangabad district", state: "Maharashtra", style: "Rock-cut", type: "Cave complex", yearStart: 600, builtLabel: "c. 600-1000 CE", patron: "Kalachuri, Chalukya and Rashtrakuta rulers", unesco: 1983, note: "Buddhist, Hindu and Jain caves including the monolithic Kailasa temple." },
  { name: "Elephanta Caves", city: "Mumbai Harbour", state: "Maharashtra", style: "Rock-cut", type: "Cave complex", yearStart: 550, builtLabel: "c. 5th-8th century CE", patron: "Kalachuri period patrons", unesco: 1987, note: "Island Shaiva caves centred on the three-headed Trimurti Sadashiva relief." },
  { name: "Sun Temple, Konark", city: "Konark", state: "Odisha", style: "Kalinga Temple", type: "Temple", yearStart: 1250, builtLabel: "c. 1250", patron: "Narasimhadeva I", unesco: 1984, note: "Temple conceived as the sun god's chariot with twelve pairs of carved stone wheels." },
  { name: "Group of Monuments at Mahabalipuram", city: "Mamallapuram", state: "Tamil Nadu", style: "Dravidian Temple", type: "Temple group", yearStart: 630, builtLabel: "7th-8th century CE", patron: "Pallava dynasty", unesco: 1984, note: "Shore Temple, monolithic rathas and the Descent of the Ganges relief." },
  { name: "Group of Monuments at Hampi", city: "Hampi", state: "Karnataka", style: "Dravidian Temple", type: "City ruins", yearStart: 1336, builtLabel: "14th-16th century", patron: "Vijayanagara emperors", unesco: 1986, note: "Capital of Vijayanagara: Virupaksha and Vittala temples, bazaars and royal enclosure." },
  { name: "Khajuraho Group of Monuments", city: "Khajuraho", state: "Madhya Pradesh", style: "Nagara Temple", type: "Temple group", yearStart: 950, builtLabel: "c. 950-1050", patron: "Chandela dynasty", unesco: 1986, note: "Hindu and Jain temples with sculpted exteriors and soaring shikharas." },
  { name: "Great Living Chola Temple, Thanjavur", city: "Thanjavur", state: "Tamil Nadu", style: "Dravidian Temple", type: "Temple", yearStart: 1003, builtLabel: "1003-1010", patron: "Rajaraja Chola I", unesco: 1987, note: "Brihadisvara temple with a 66 m vimana; still in daily worship." },
  { name: "Group of Monuments at Pattadakal", city: "Pattadakal", state: "Karnataka", style: "Vesara & Hoysala", type: "Temple group", yearStart: 700, builtLabel: "7th-8th century CE", patron: "Chalukyas of Badami", unesco: 1987, note: "Where northern Nagara and southern Dravidian temple forms were built side by side." },
  { name: "Buddhist Monuments at Sanchi", city: "Sanchi", state: "Madhya Pradesh", style: "Buddhist Stupa & Vihara", type: "Stupa complex", yearStart: -250, builtLabel: "3rd century BCE - 12th century CE", patron: "Ashoka and later Satavahana donors", unesco: 1989, note: "Great Stupa with carved toranas; the oldest surviving Buddhist sanctuary in India." },
  { name: "Humayun's Tomb", city: "Delhi", state: "Delhi", style: "Mughal", type: "Tomb", yearStart: 1565, builtLabel: "1565-1572", patron: "Empress Bega Begum", unesco: 1993, note: "First fully realised Mughal garden tomb; the template that led to the Taj Mahal." },
  { name: "Qutb Minar and its Monuments", city: "Delhi", state: "Delhi", style: "Indo-Islamic (Sultanate)", type: "Minaret complex", yearStart: 1199, builtLabel: "1199-1368", patron: "Qutb-ud-din Aibak and successors", unesco: 1993, note: "72.5 m tapering minaret with the Quwwat-ul-Islam mosque and the Iron Pillar." },
  { name: "Mahabodhi Temple Complex", city: "Bodh Gaya", state: "Bihar", style: "Buddhist Stupa & Vihara", type: "Temple", yearStart: 250, builtLabel: "Ashokan origin, present temple 5th-6th century CE", patron: "Ashoka, Gupta-period rebuilders", unesco: 2002, note: "Marks the site of the Buddha's enlightenment beside the Bodhi tree." },
  { name: "Rock Shelters of Bhimbetka", city: "Raisen district", state: "Madhya Pradesh", style: "Prehistoric & Harappan", type: "Rock art", yearStart: -30000, builtLabel: "Palaeolithic onward", patron: "Prehistoric communities", unesco: 2003, note: "Hundreds of shelters with painting sequences spanning tens of thousands of years." },
  { name: "Champaner-Pavagadh Archaeological Park", city: "Panchmahal district", state: "Gujarat", style: "Indo-Islamic (Sultanate)", type: "Archaeological park", yearStart: 1484, builtLabel: "8th century hill temples; 15th-16th century city", patron: "Sultan Mahmud Begada", unesco: 2004, note: "Only largely unchanged pre-Mughal Islamic city, with the Jami Masjid." },
  { name: "Chhatrapati Shivaji Maharaj Terminus", city: "Mumbai", state: "Maharashtra", style: "Colonial & Victorian Gothic", type: "Railway station", yearStart: 1878, builtLabel: "1878-1888", patron: "Great Indian Peninsula Railway", unesco: 2004, note: "Victorian Gothic Revival station by F. W. Stevens with Indian decorative detail." },
  { name: "Red Fort Complex", city: "Delhi", state: "Delhi", style: "Mughal", type: "Fort", yearStart: 1638, builtLabel: "1638-1648", patron: "Shah Jahan", unesco: 2007, note: "Shahjahanabad's palace-fort; the Diwan-i-Am and Diwan-i-Khas survive inside." },
  { name: "Jantar Mantar, Jaipur", city: "Jaipur", state: "Rajasthan", style: "Rajput", type: "Observatory", yearStart: 1728, builtLabel: "1728-1734", patron: "Sawai Jai Singh II", unesco: 2010, note: "Nineteen masonry instruments including the 27 m Samrat Yantra sundial." },
  { name: "Chittorgarh Fort", city: "Chittorgarh", state: "Rajasthan", style: "Rajput", type: "Fort", yearStart: 700, builtLabel: "7th century onward; Vijaya Stambha 1448", patron: "Guhila and Sisodia rulers", unesco: 2013, note: "Largest of the Hill Forts of Rajasthan, with the Tower of Victory." },
  { name: "Kumbhalgarh Fort", city: "Rajsamand district", state: "Rajasthan", style: "Rajput", type: "Fort", yearStart: 1443, builtLabel: "1443-1458", patron: "Rana Kumbha", unesco: 2013, note: "Perimeter wall runs about 36 km, among the longest continuous fort walls anywhere." },
  { name: "Amber Fort", city: "Amer, Jaipur", state: "Rajasthan", style: "Rajput", type: "Fort", yearStart: 1592, builtLabel: "1592 onward", patron: "Raja Man Singh I", unesco: 2013, note: "Hill palace with the mirrored Sheesh Mahal; part of the Hill Forts of Rajasthan." },
  { name: "Jaisalmer Fort", city: "Jaisalmer", state: "Rajasthan", style: "Rajput", type: "Fort", yearStart: 1156, builtLabel: "founded 1156", patron: "Rawal Jaisal", unesco: 2013, note: "Yellow sandstone desert fort still inhabited by several thousand residents." },
  { name: "Rani ki Vav", city: "Patan", state: "Gujarat", style: "Stepwell", type: "Stepwell", yearStart: 1063, builtLabel: "11th century", patron: "Queen Udayamati", unesco: 2014, note: "Seven-storey inverted temple stepwell with over 500 principal sculptures." },
  { name: "Nalanda Mahavihara", city: "Nalanda", state: "Bihar", style: "Buddhist Stupa & Vihara", type: "Monastic university", yearStart: 427, builtLabel: "5th-13th century CE", patron: "Gupta and Pala rulers", unesco: 2016, note: "Excavated stupas, viharas and shrines of the ancient Buddhist university." },
  { name: "Capitol Complex, Chandigarh", city: "Chandigarh", state: "Chandigarh", style: "Modernist", type: "Civic complex", yearStart: 1952, builtLabel: "1952-1965", patron: "Government of India", unesco: 2016, note: "Le Corbusier's Assembly, High Court and Secretariat, inscribed in a transnational listing." },
  { name: "Historic City of Ahmedabad", city: "Ahmedabad", state: "Gujarat", style: "Indo-Islamic (Sultanate)", type: "Historic city", yearStart: 1411, builtLabel: "founded 1411", patron: "Sultan Ahmad Shah I", unesco: 2017, note: "Walled city of pols, the Jami Masjid and Sidi Saiyyed's stone jali screen." },
  { name: "Victorian Gothic and Art Deco Ensembles of Mumbai", city: "Mumbai", state: "Maharashtra", style: "Colonial & Victorian Gothic", type: "Urban ensemble", yearStart: 1860, builtLabel: "1860s-1930s", patron: "Bombay Presidency and private builders", unesco: 2018, note: "Gothic Revival public buildings facing Art Deco blocks across the Oval Maidan." },
  { name: "Walled City of Jaipur", city: "Jaipur", state: "Rajasthan", style: "Rajput", type: "Historic city", yearStart: 1727, builtLabel: "founded 1727", patron: "Sawai Jai Singh II", unesco: 2019, note: "Grid-planned pink city with Hawa Mahal, City Palace and chaupar squares." },
  { name: "Kakatiya Rudreshwara (Ramappa) Temple", city: "Palampet", state: "Telangana", style: "Vesara & Hoysala", type: "Temple", yearStart: 1213, builtLabel: "1213", patron: "Kakatiya ruler Ganapati Deva", unesco: 2021, note: "Built on a sandbox foundation with lightweight floating bricks in the tower." },
  { name: "Dholavira", city: "Kachchh district", state: "Gujarat", style: "Prehistoric & Harappan", type: "Harappan city", yearStart: -3000, builtLabel: "c. 3000-1500 BCE", patron: "Indus Valley civilisation", unesco: 2021, note: "Harappan city with a sophisticated water-harvesting and reservoir system." },
  { name: "Santiniketan", city: "Bolpur", state: "West Bengal", style: "Modernist", type: "Campus", yearStart: 1901, builtLabel: "from 1901", patron: "Rabindranath Tagore", unesco: 2023, note: "Ashram and university campus expressing pan-Asian modernism." },
  { name: "Chennakeshava Temple, Belur", city: "Belur", state: "Karnataka", style: "Vesara & Hoysala", type: "Temple", yearStart: 1117, builtLabel: "begun 1117", patron: "Hoysala king Vishnuvardhana", unesco: 2023, note: "Soapstone temple with bracket figures; part of the Sacred Ensembles of the Hoysalas." },
  { name: "Hoysaleswara Temple, Halebidu", city: "Halebidu", state: "Karnataka", style: "Vesara & Hoysala", type: "Temple", yearStart: 1121, builtLabel: "12th century", patron: "Hoysala dynasty", unesco: 2023, note: "Twin-shrine temple wrapped in continuous friezes of elephants, horses and epics." },
  { name: "Keshava Temple, Somanathapura", city: "Somanathapura", state: "Karnataka", style: "Vesara & Hoysala", type: "Temple", yearStart: 1268, builtLabel: "1268", patron: "General Somanatha under Narasimha III", unesco: 2023, note: "Complete trikuta (three-shrine) Hoysala temple on a star-shaped plan." },
  { name: "Moidams of Charaideo", city: "Charaideo", state: "Assam", style: "Regional Vernacular", type: "Burial mounds", yearStart: 1228, builtLabel: "13th-19th century", patron: "Ahom dynasty", unesco: 2024, note: "Vaulted burial mounds of Ahom royalty, India's first World Heritage site from the North East." },
  { name: "Charminar", city: "Hyderabad", state: "Telangana", style: "Deccan Sultanate", type: "Monument", yearStart: 1591, builtLabel: "1591", patron: "Muhammad Quli Qutb Shah", unesco: null, note: "Four-arched, four-minaret gateway at the centre of the old city." },
  { name: "Golconda Fort", city: "Hyderabad", state: "Telangana", style: "Deccan Sultanate", type: "Fort", yearStart: 1518, builtLabel: "rebuilt in stone from 1518", patron: "Qutb Shahi dynasty", unesco: null, note: "Granite hill fort known for acoustics that carry a clap to the citadel." },
  { name: "Gol Gumbaz", city: "Vijayapura (Bijapur)", state: "Karnataka", style: "Deccan Sultanate", type: "Tomb", yearStart: 1626, builtLabel: "1626-1656", patron: "Mohammed Adil Shah", unesco: null, note: "Dome about 44 m across, one of the largest masonry domes in the world." },
  { name: "Mysore Palace", city: "Mysuru", state: "Karnataka", style: "Indo-Saracenic", type: "Palace", yearStart: 1897, builtLabel: "1897-1912", patron: "Wadiyar dynasty", unesco: null, note: "Designed by Henry Irwin after fire destroyed the earlier wooden palace." },
  { name: "Meenakshi Amman Temple", city: "Madurai", state: "Tamil Nadu", style: "Dravidian Temple", type: "Temple", yearStart: 1623, builtLabel: "present structure 17th century", patron: "Nayaka rulers of Madurai", unesco: null, note: "Fourteen gopurams and the thousand-pillar hall around twin shrines." },
  { name: "Ramanathaswamy Temple", city: "Rameswaram", state: "Tamil Nadu", style: "Dravidian Temple", type: "Temple", yearStart: 1150, builtLabel: "12th century onward", patron: "Pandya and later Setupati rulers", unesco: null, note: "Third corridor runs about 1.2 km, the longest temple corridor in India." },
  { name: "Brihadisvara Temple, Gangaikonda Cholapuram", city: "Gangaikonda Cholapuram", state: "Tamil Nadu", style: "Dravidian Temple", type: "Temple", yearStart: 1035, builtLabel: "c. 1035", patron: "Rajendra Chola I", unesco: 1987, note: "Second of the Great Living Chola Temples, built for a new Chola capital." },
  { name: "Airavatesvara Temple, Darasuram", city: "Darasuram", state: "Tamil Nadu", style: "Dravidian Temple", type: "Temple", yearStart: 1166, builtLabel: "12th century", patron: "Rajaraja Chola II", unesco: 1987, note: "Chariot-shaped mandapa with finely carved miniature friezes." },
  { name: "Hawa Mahal", city: "Jaipur", state: "Rajasthan", style: "Rajput", type: "Palace", yearStart: 1799, builtLabel: "1799", patron: "Sawai Pratap Singh", unesco: null, note: "Five-storey screen of 953 jharokha windows for the women of the court." },
  { name: "Mehrangarh Fort", city: "Jodhpur", state: "Rajasthan", style: "Rajput", type: "Fort", yearStart: 1459, builtLabel: "founded 1459", patron: "Rao Jodha", unesco: null, note: "Cliff-top fort rising roughly 120 m above the blue city." },
  { name: "City Palace, Udaipur", city: "Udaipur", state: "Rajasthan", style: "Rajput", type: "Palace", yearStart: 1559, builtLabel: "from 1559", patron: "Maharana Udai Singh II and successors", unesco: null, note: "Complex of eleven palaces built over four centuries on Lake Pichola." },
  { name: "Junagarh Fort", city: "Bikaner", state: "Rajasthan", style: "Rajput", type: "Fort", yearStart: 1589, builtLabel: "1589-1594", patron: "Raja Rai Singh", unesco: null, note: "Rare plains fort never taken by siege, with lacquered and mirrored interiors." },
  { name: "Chand Baori", city: "Abhaneri", state: "Rajasthan", style: "Stepwell", type: "Stepwell", yearStart: 850, builtLabel: "9th century", patron: "Nikumbha dynasty", unesco: null, note: "About 3,500 steps in thirteen storeys down to the water table." },
  { name: "Dilwara Jain Temples", city: "Mount Abu", state: "Rajasthan", style: "Jain Temple", type: "Temple group", yearStart: 1031, builtLabel: "1031-1230", patron: "Solanki-era Jain ministers", unesco: null, note: "Five marble temples known for translucent carved ceilings and pillars." },
  { name: "Ranakpur Jain Temple", city: "Ranakpur", state: "Rajasthan", style: "Jain Temple", type: "Temple", yearStart: 1437, builtLabel: "15th century", patron: "Merchant Dharna Shah under Rana Kumbha", unesco: null, note: "Chaumukha temple carried on 1,444 individually carved marble pillars." },
  { name: "Gwalior Fort", city: "Gwalior", state: "Madhya Pradesh", style: "Rajput", type: "Fort", yearStart: 800, builtLabel: "8th century onward; Man Mandir 1486-1516", patron: "Tomar rulers, notably Man Singh", unesco: null, note: "Sandstone hill fort with tiled Man Mandir palace and rock-cut Jain colossi." },
  { name: "Jahaz Mahal, Mandu", city: "Mandu", state: "Madhya Pradesh", style: "Indo-Islamic (Sultanate)", type: "Palace", yearStart: 1469, builtLabel: "late 15th century", patron: "Ghiyas-ud-din Khalji", unesco: null, note: "Ship-shaped palace set between two artificial lakes in the Malwa hill capital." },
  { name: "Orchha Fort Complex", city: "Orchha", state: "Madhya Pradesh", style: "Rajput", type: "Palace fort", yearStart: 1531, builtLabel: "16th-17th century", patron: "Bundela rulers", unesco: null, note: "Jahangir Mahal and Raj Mahal on an island in the Betwa river." },
  { name: "Sun Temple, Modhera", city: "Modhera", state: "Gujarat", style: "Nagara Temple", type: "Temple", yearStart: 1026, builtLabel: "1026-1027", patron: "Bhima I of the Solanki dynasty", unesco: null, note: "Aligned so that sunrise at the equinox reaches the sanctum, with a stepped tank." },
  { name: "Somnath Temple", city: "Prabhas Patan", state: "Gujarat", style: "Nagara Temple", type: "Temple", yearStart: 1951, builtLabel: "present temple 1947-1951", patron: "Reconstructed by the Government of India", unesco: null, note: "Chalukya-style rebuild of a shrine destroyed and rebuilt many times." },
  { name: "Adalaj Stepwell", city: "Adalaj", state: "Gujarat", style: "Stepwell", type: "Stepwell", yearStart: 1498, builtLabel: "1498", patron: "Queen Rudabai", unesco: null, note: "Five-storey octagonal well blending Solanki and Islamic ornament." },
  { name: "Jagannath Temple", city: "Puri", state: "Odisha", style: "Kalinga Temple", type: "Temple", yearStart: 1161, builtLabel: "12th century", patron: "Eastern Ganga king Anantavarman Chodaganga", unesco: null, note: "Deul rises about 65 m; focus of the annual Rath Yatra chariot festival." },
  { name: "Lingaraj Temple", city: "Bhubaneswar", state: "Odisha", style: "Kalinga Temple", type: "Temple", yearStart: 1090, builtLabel: "11th century", patron: "Somavamshi and Ganga rulers", unesco: null, note: "Fully developed Kalinga temple with all four canonical halls." },
  { name: "Udayagiri and Khandagiri Caves", city: "Bhubaneswar", state: "Odisha", style: "Rock-cut", type: "Cave complex", yearStart: -100, builtLabel: "1st century BCE", patron: "Kharavela of Kalinga", unesco: null, note: "Jain monastic cells carrying the Hathigumpha inscription." },
  { name: "Golden Temple (Harmandir Sahib)", city: "Amritsar", state: "Punjab", style: "Sikh", type: "Gurdwara", yearStart: 1589, builtLabel: "foundation 1589; gilding 1830s", patron: "Guru Arjan; gilded under Maharaja Ranjit Singh", unesco: null, note: "Gilded sanctum set in the Amrit Sarovar tank, open on all four sides." },
  { name: "Bara Imambara", city: "Lucknow", state: "Uttar Pradesh", style: "Nawabi & Awadhi", type: "Imambara", yearStart: 1784, builtLabel: "1784", patron: "Nawab Asaf-ud-Daula", unesco: null, note: "Central hall spans about 50 m with no supporting beams; includes the Bhulbhulaiya maze." },
  { name: "Rumi Darwaza", city: "Lucknow", state: "Uttar Pradesh", style: "Nawabi & Awadhi", type: "Gateway", yearStart: 1784, builtLabel: "1784", patron: "Nawab Asaf-ud-Daula", unesco: null, note: "Sixty-foot gateway modelled on an Ottoman gate in Istanbul." },
  { name: "Dhamek Stupa, Sarnath", city: "Sarnath", state: "Uttar Pradesh", style: "Buddhist Stupa & Vihara", type: "Stupa", yearStart: 500, builtLabel: "c. 500 CE on a 249 BCE core", patron: "Gupta-period rebuilding of an Ashokan stupa", unesco: null, note: "Marks the deer park where the Buddha gave his first sermon." },
  { name: "Jama Masjid, Delhi", city: "Delhi", state: "Delhi", style: "Mughal", type: "Mosque", yearStart: 1650, builtLabel: "1650-1656", patron: "Shah Jahan", unesco: null, note: "Courtyard holds around 25,000 worshippers; India's largest Mughal mosque." },
  { name: "Safdarjung's Tomb", city: "Delhi", state: "Delhi", style: "Mughal", type: "Tomb", yearStart: 1754, builtLabel: "1754", patron: "Nawab Shuja-ud-Daula", unesco: null, note: "Last substantial garden tomb of the Mughal era, in the charbagh plan." },
  { name: "Purana Qila", city: "Delhi", state: "Delhi", style: "Indo-Islamic (Sultanate)", type: "Fort", yearStart: 1533, builtLabel: "1533-1545", patron: "Humayun and Sher Shah Suri", unesco: null, note: "Rubble-and-sandstone fort with the Qila-i-Kuhna mosque and Sher Mandal." },
  { name: "India Gate", city: "Delhi", state: "Delhi", style: "Colonial & Victorian Gothic", type: "War memorial", yearStart: 1921, builtLabel: "1921-1931", patron: "Imperial War Graves Commission", unesco: null, note: "Edwin Lutyens' 42 m arch inscribed with the names of Indian war dead." },
  { name: "Victoria Memorial", city: "Kolkata", state: "West Bengal", style: "Indo-Saracenic", type: "Memorial", yearStart: 1906, builtLabel: "1906-1921", patron: "Lord Curzon", unesco: null, note: "Makrana marble memorial by William Emerson combining British and Mughal motifs." },
  { name: "Gateway of India", city: "Mumbai", state: "Maharashtra", style: "Indo-Saracenic", type: "Gateway", yearStart: 1913, builtLabel: "1913-1924", patron: "Government of Bombay", unesco: null, note: "Basalt arch by George Wittet marking the 1911 royal landing." },
  { name: "Bibi Ka Maqbara", city: "Chhatrapati Sambhajinagar", state: "Maharashtra", style: "Mughal", type: "Tomb", yearStart: 1660, builtLabel: "c. 1660-1661", patron: "Prince Azam Shah", unesco: null, note: "Deccan echo of the Taj Mahal, built for Aurangzeb's wife Dilras Banu Begum." },
  { name: "Daulatabad Fort", city: "Daulatabad", state: "Maharashtra", style: "Indo-Islamic (Sultanate)", type: "Fort", yearStart: 1187, builtLabel: "12th century onward", patron: "Yadava dynasty, later Tughlaqs", unesco: null, note: "Conical hill fort with a moat and a dark spiral passage as defence." },
  { name: "Badami Cave Temples", city: "Badami", state: "Karnataka", style: "Rock-cut", type: "Cave complex", yearStart: 578, builtLabel: "6th century CE", patron: "Chalukyas of Badami", unesco: null, note: "Four sandstone caves for Shiva, Vishnu and Jain worship above Agastya lake." },
  { name: "Gommateshwara Statue, Shravanabelagola", city: "Shravanabelagola", state: "Karnataka", style: "Jain Temple", type: "Monolith", yearStart: 981, builtLabel: "c. 981", patron: "Chavundaraya, minister of the Western Gangas", unesco: null, note: "17 m monolithic figure of Bahubali carved from a single granite block." },
  { name: "Warangal Fort and Thousand Pillar Temple", city: "Warangal", state: "Telangana", style: "Vesara & Hoysala", type: "Fort and temple", yearStart: 1163, builtLabel: "12th-13th century", patron: "Kakatiya dynasty", unesco: null, note: "Kakatiya toranas and a star-plan triple-shrine temple with a rock-cut Nandi." },
  { name: "Lepakshi Veerabhadra Temple", city: "Lepakshi", state: "Andhra Pradesh", style: "Dravidian Temple", type: "Temple", yearStart: 1530, builtLabel: "1530s", patron: "Vijayanagara governors Virupanna and Viranna", unesco: null, note: "Vijayanagara mural ceilings and a hanging pillar that barely touches the floor." },
  { name: "Padmanabhaswamy Temple", city: "Thiruvananthapuram", state: "Kerala", style: "Dravidian Temple", type: "Temple", yearStart: 1733, builtLabel: "present gopuram 18th century", patron: "Travancore royal house", unesco: null, note: "Kerala-Dravidian temple with a seven-tier gopuram and a corridor of granite pillars." },
  { name: "Mattancherry Palace", city: "Kochi", state: "Kerala", style: "Regional Vernacular", type: "Palace", yearStart: 1555, builtLabel: "c. 1555, remodelled 1663", patron: "Portuguese, later Dutch, for the Cochin rajas", unesco: null, note: "Kerala nalukettu plan holding some of India's finest temple-style murals." },
  { name: "Bekal Fort", city: "Kasaragod", state: "Kerala", style: "Regional Vernacular", type: "Fort", yearStart: 1650, builtLabel: "c. 1650", patron: "Shivappa Nayaka of Keladi", unesco: null, note: "Laterite sea fort with an observation tower over the Arabian Sea." },
  { name: "Hemis Monastery", city: "Hemis, Leh", state: "Ladakh", style: "Tibetan Buddhist Monastic", type: "Monastery", yearStart: 1672, builtLabel: "re-established 1672", patron: "King Sengge Namgyal", unesco: null, note: "Largest Drukpa lineage gompa in Ladakh; hosts the masked Hemis festival." },
  { name: "Thiksey Monastery", city: "Thiksey, Leh", state: "Ladakh", style: "Tibetan Buddhist Monastic", type: "Monastery", yearStart: 1430, builtLabel: "15th century", patron: "Gelug order", unesco: null, note: "Twelve-storey hillside complex with a 15 m Maitreya Buddha." },
  { name: "Tawang Monastery", city: "Tawang", state: "Arunachal Pradesh", style: "Tibetan Buddhist Monastic", type: "Monastery", yearStart: 1680, builtLabel: "founded c. 1680", patron: "Merak Lama Lodre Gyatso", unesco: null, note: "Largest monastery in India and among the largest Gelug gompas anywhere." },
  { name: "Rumtek Monastery", city: "Gangtok", state: "Sikkim", style: "Tibetan Buddhist Monastic", type: "Monastery", yearStart: 1966, builtLabel: "present complex 1961-1966", patron: "16th Karmapa", unesco: null, note: "Seat in exile of the Karma Kagyu lineage, modelled on Tsurphu in Tibet." },
  { name: "Cellular Jail", city: "Port Blair", state: "Andaman and Nicobar Islands", style: "Colonial & Victorian Gothic", type: "Prison", yearStart: 1896, builtLabel: "1896-1906", patron: "British colonial government", unesco: null, note: "Seven radiating wings of solitary cells used to jail Indian political prisoners." },
  { name: "Hazarduari Palace", city: "Murshidabad", state: "West Bengal", style: "Indo-Saracenic", type: "Palace", yearStart: 1829, builtLabel: "1829-1837", patron: "Nawab Nazim Humayun Jah", unesco: null, note: "Neoclassical palace named for its thousand doors, many of them false." },
  { name: "Amaravati Stupa", city: "Amaravati", state: "Andhra Pradesh", style: "Buddhist Stupa & Vihara", type: "Stupa", yearStart: -200, builtLabel: "2nd century BCE - 3rd century CE", patron: "Satavahana patrons", unesco: null, note: "Ruined mahachaitya whose carved limestone drum slabs defined the Amaravati school." },
  { name: "Kangra Fort", city: "Kangra", state: "Himachal Pradesh", style: "Rajput", type: "Fort", yearStart: 400, builtLabel: "referenced from ancient times; rebuilt over centuries", patron: "Katoch dynasty", unesco: null, note: "One of the oldest continuously recorded forts in India, damaged in the 1905 earthquake." },
  { name: "Lotus Temple", city: "Delhi", state: "Delhi", style: "Modernist", type: "House of worship", yearStart: 1980, builtLabel: "1980-1986", patron: "Baha'i community of India", unesco: null, note: "Twenty-seven marble petals in nine groups by architect Fariborz Sahba." },
];

/** Sort keys the explorer offers. */
export const SORTS = [
  { id: "name", label: "Name (A-Z)" },
  { id: "oldest", label: "Oldest first" },
  { id: "newest", label: "Newest first" },
  { id: "state", label: "State (A-Z)" },
];

const collator = new Intl.Collator("en", { sensitivity: "base" });

/** Human label for a construction year: negative years are BCE. */
export function formatYear(year) {
  if (!Number.isFinite(year)) return "Unknown";
  if (year < 0) return `${Math.abs(Math.round(year))} BCE`;
  return `${Math.round(year)} CE`;
}

/** Which era bucket a start year falls into. Returns null when out of range. */
export function eraForYear(year) {
  if (!Number.isFinite(year)) return null;
  return ERAS.find((era) => year >= era.from && year <= era.to) || null;
}

/** Sorted unique list of states present in the dataset. */
export function listStates() {
  const seen = new Set(MONUMENTS.map((m) => m.state));
  return Array.from(seen).sort((a, b) => collator.compare(a, b));
}

/** Sorted unique list of styles actually used by at least one monument. */
export function listStyles() {
  const used = new Set(MONUMENTS.map((m) => m.style));
  return STYLES.filter((style) => used.has(style));
}

function matchesQuery(monument, needle) {
  if (!needle) return true;
  const haystack = [
    monument.name,
    monument.city,
    monument.state,
    monument.style,
    monument.type,
    monument.patron,
    monument.note,
    monument.builtLabel,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

/**
 * Filter and sort the monument set.
 * Always returns an object; on bad input it returns { error } and an empty list.
 */
export function filterMonuments({
  query = "",
  state = "all",
  era = "all",
  style = "all",
  unescoOnly = false,
  sort = "name",
} = {}) {
  const needle = String(query ?? "").trim().toLowerCase();
  if (needle.length > 80) {
    return { error: "Search text is too long — try a shorter keyword.", items: [], total: 0 };
  }

  const eraDef = era === "all" ? null : ERAS.find((entry) => entry.id === era);
  if (era !== "all" && !eraDef) {
    return { error: "Unknown era selected.", items: [], total: 0 };
  }

  const items = MONUMENTS.filter((monument) => {
    if (state !== "all" && monument.state !== state) return false;
    if (style !== "all" && monument.style !== style) return false;
    if (unescoOnly && !monument.unesco) return false;
    if (eraDef) {
      const bucket = eraForYear(monument.yearStart);
      if (!bucket || bucket.id !== eraDef.id) return false;
    }
    return matchesQuery(monument, needle);
  });

  const sorted = items.slice().sort((a, b) => {
    if (sort === "oldest") return a.yearStart - b.yearStart || collator.compare(a.name, b.name);
    if (sort === "newest") return b.yearStart - a.yearStart || collator.compare(a.name, b.name);
    if (sort === "state") {
      return collator.compare(a.state, b.state) || collator.compare(a.name, b.name);
    }
    return collator.compare(a.name, b.name);
  });

  return { items: sorted, total: sorted.length };
}

/** Headline counts for a result set. */
export function summarise(items = []) {
  const list = Array.isArray(items) ? items : [];
  const states = new Set();
  const styles = new Set();
  let unescoCount = 0;
  let oldest = null;
  let newest = null;

  for (const monument of list) {
    states.add(monument.state);
    styles.add(monument.style);
    if (monument.unesco) unescoCount += 1;
    if (oldest === null || monument.yearStart < oldest) oldest = monument.yearStart;
    if (newest === null || monument.yearStart > newest) newest = monument.yearStart;
  }

  return {
    count: list.length,
    states: states.size,
    styles: styles.size,
    unescoCount,
    oldest,
    newest,
    span: oldest === null || newest === null ? 0 : newest - oldest,
  };
}
