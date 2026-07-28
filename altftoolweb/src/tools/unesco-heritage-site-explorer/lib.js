/**
 * UNESCO Heritage Site Explorer — reference data and query logic.
 *
 * Data source: the UNESCO World Heritage List. `year` is the year the World
 * Heritage Committee inscribed the property; `category` uses the Convention's
 * three inscription categories (Cultural, Natural, Mixed); `region` uses the
 * five UNESCO World Heritage regions. This is a curated subset of the List,
 * not the complete register.
 */

/** The World Heritage Convention was adopted in 1972; the first list was inscribed in 1978. */
export const FIRST_INSCRIPTION_YEAR = 1978;
/** Latest inscription session covered by this dataset. */
export const LATEST_DATA_YEAR = 2024;

/** The three inscription categories defined by the World Heritage Convention. */
export const CATEGORIES = [
  { id: "Cultural", label: "Cultural", note: "Monuments, groups of buildings and cultural landscapes." },
  { id: "Natural", label: "Natural", note: "Habitats, geological formations and areas of outstanding natural beauty." },
  { id: "Mixed", label: "Mixed", note: "Properties that meet both cultural and natural criteria." },
];

/** UNESCO's five World Heritage regions. */
export const REGIONS = [
  "Africa",
  "Arab States",
  "Asia and the Pacific",
  "Europe and North America",
  "Latin America and the Caribbean",
];

export const SITES = [
  // --- 1978: the first twelve properties ever inscribed ---
  { name: "Galapagos Islands", country: "Ecuador", region: "Latin America and the Caribbean", category: "Natural", year: 1978, note: "Volcanic archipelago whose endemic species shaped Darwin's theory of natural selection." },
  { name: "City of Quito", country: "Ecuador", region: "Latin America and the Caribbean", category: "Cultural", year: 1978, note: "Best-preserved historic centre in Latin America, largely intact after the 1917 earthquake." },
  { name: "Aachen Cathedral", country: "Germany", region: "Europe and North America", category: "Cultural", year: 1978, note: "Charlemagne's palatine chapel, the model for church building across the Carolingian empire." },
  { name: "L'Anse aux Meadows National Historic Site", country: "Canada", region: "Europe and North America", category: "Cultural", year: 1978, note: "The only confirmed Norse settlement in North America, dating to about 1000 CE." },
  { name: "Nahanni National Park", country: "Canada", region: "Europe and North America", category: "Natural", year: 1978, note: "Deep river canyons and Virginia Falls, roughly twice the height of Niagara." },
  { name: "Historic Centre of Krakow", country: "Poland", region: "Europe and North America", category: "Cultural", year: 1978, note: "Medieval market square, Wawel Castle and one of Europe's oldest universities." },
  { name: "Wieliczka and Bochnia Royal Salt Mines", country: "Poland", region: "Europe and North America", category: "Cultural", year: 1978, note: "Seven centuries of salt mining, including chapels carved entirely from rock salt." },
  { name: "Mesa Verde National Park", country: "United States", region: "Europe and North America", category: "Cultural", year: 1978, note: "Ancestral Puebloan cliff dwellings occupied from the 6th to the 12th century." },
  { name: "Yellowstone National Park", country: "United States", region: "Europe and North America", category: "Natural", year: 1978, note: "The world's first national park, with roughly half the planet's active geysers." },
  { name: "Simien National Park", country: "Ethiopia", region: "Africa", category: "Natural", year: 1978, note: "Eroded highland massif home to the gelada, walia ibex and Ethiopian wolf." },
  { name: "Rock-Hewn Churches, Lalibela", country: "Ethiopia", region: "Africa", category: "Cultural", year: 1978, note: "Eleven medieval churches cut downward into solid volcanic rock." },
  { name: "Island of Goree", country: "Senegal", region: "Africa", category: "Cultural", year: 1978, note: "Atlantic slave-trading post off Dakar, a memorial to the transatlantic trade." },

  // --- Africa ---
  { name: "Great Zimbabwe National Monument", country: "Zimbabwe", region: "Africa", category: "Cultural", year: 1986, note: "Dry-stone capital of a 11th-15th century Shona state, built without mortar." },
  { name: "Mosi-oa-Tunya / Victoria Falls", country: "Zambia and Zimbabwe", region: "Africa", category: "Natural", year: 1989, note: "The Zambezi drops about 108 m along a 1.7 km curtain of water." },
  { name: "Serengeti National Park", country: "Tanzania", region: "Africa", category: "Natural", year: 1981, note: "Annual migration of over a million wildebeest and hundreds of thousands of zebra." },
  { name: "Ngorongoro Conservation Area", country: "Tanzania", region: "Africa", category: "Mixed", year: 1979, note: "Intact volcanic caldera plus Olduvai Gorge, a key site for early hominin fossils." },
  { name: "Kilimanjaro National Park", country: "Tanzania", region: "Africa", category: "Natural", year: 1987, note: "Africa's highest peak at 5,895 m, rising alone above the surrounding plains." },
  { name: "Stone Town of Zanzibar", country: "Tanzania", region: "Africa", category: "Cultural", year: 2000, note: "Swahili coastal trading town fusing African, Arab, Indian and European building." },
  { name: "Lamu Old Town", country: "Kenya", region: "Africa", category: "Cultural", year: 2001, note: "Oldest continuously inhabited Swahili settlement in East Africa." },
  { name: "Fossil Hominid Sites of South Africa", country: "South Africa", region: "Africa", category: "Cultural", year: 1999, note: "The Cradle of Humankind caves, source of a large share of early hominin fossils." },
  { name: "Robben Island", country: "South Africa", region: "Africa", category: "Cultural", year: 1999, note: "Prison island where Nelson Mandela was held for eighteen of his twenty-seven years." },
  { name: "Cape Floral Region Protected Areas", country: "South Africa", region: "Africa", category: "Natural", year: 2004, note: "One of the world's six floral kingdoms, with extraordinary plant endemism." },
  { name: "Maloti-Drakensberg Park", country: "South Africa and Lesotho", region: "Africa", category: "Mixed", year: 2000, note: "Basalt escarpment holding the largest concentration of San rock art in Africa." },
  { name: "Mapungubwe Cultural Landscape", country: "South Africa", region: "Africa", category: "Cultural", year: 2003, note: "Capital of the largest kingdom in the subcontinent before it was abandoned c. 1300." },
  { name: "Timbuktu", country: "Mali", region: "Africa", category: "Cultural", year: 1988, note: "Mosques and madrasas of a 15th-16th century centre of Islamic learning." },
  { name: "Old Towns of Djenne", country: "Mali", region: "Africa", category: "Cultural", year: 1988, note: "Sudano-Sahelian mudbrick architecture crowned by the Great Mosque." },
  { name: "Cliff of Bandiagara (Land of the Dogons)", country: "Mali", region: "Africa", category: "Mixed", year: 1989, note: "Sandstone escarpment with Dogon villages, granaries and Tellem cliff dwellings." },
  { name: "Royal Palaces of Abomey", country: "Benin", region: "Africa", category: "Cultural", year: 1985, note: "Twelve earthen palaces of the kings of Dahomey, built between 1625 and 1900." },
  { name: "Osun-Osogbo Sacred Grove", country: "Nigeria", region: "Africa", category: "Cultural", year: 2005, note: "Forest sanctuary of the Yoruba goddess Osun, with contemporary sculpture and shrines." },
  { name: "Forts and Castles, Volta, Greater Accra, Central and Western Regions", country: "Ghana", region: "Africa", category: "Cultural", year: 1979, note: "Trading posts built 1482-1786, later central to the Atlantic slave trade." },
  { name: "Virunga National Park", country: "Democratic Republic of the Congo", region: "Africa", category: "Natural", year: 1979, note: "Africa's oldest national park, sheltering mountain gorillas and active volcanoes." },
  { name: "Okavango Delta", country: "Botswana", region: "Africa", category: "Natural", year: 2014, note: "Inland delta that floods in the dry season, the 1000th site added to the List." },
  { name: "Namib Sand Sea", country: "Namibia", region: "Africa", category: "Natural", year: 2013, note: "Coastal fog desert with some of the tallest dunes on Earth." },
  { name: "Aksum", country: "Ethiopia", region: "Africa", category: "Cultural", year: 1980, note: "Granite obelisks and royal tombs of the Aksumite kingdom." },
  { name: "Fasil Ghebbi, Gondar Region", country: "Ethiopia", region: "Africa", category: "Cultural", year: 1979, note: "Fortress-city of 16th-17th century Ethiopian emperors, walled and castellated." },
  { name: "Harar Jugol, the Fortified Historic Town", country: "Ethiopia", region: "Africa", category: "Cultural", year: 2006, note: "Walled Islamic town with 82 mosques within a compact historic core." },

  // --- Arab States ---
  { name: "Memphis and its Necropolis - the Pyramid Fields from Giza to Dahshur", country: "Egypt", region: "Arab States", category: "Cultural", year: 1979, note: "The Great Pyramid, the Sphinx and the stepped and bent pyramids of the Old Kingdom." },
  { name: "Ancient Thebes with its Necropolis", country: "Egypt", region: "Arab States", category: "Cultural", year: 1979, note: "Karnak, Luxor and the Valleys of the Kings and Queens on the Nile's west bank." },
  { name: "Nubian Monuments from Abu Simbel to Philae", country: "Egypt", region: "Arab States", category: "Cultural", year: 1979, note: "Temples relocated in the 1960s UNESCO campaign that inspired the Convention itself." },
  { name: "Historic Cairo", country: "Egypt", region: "Arab States", category: "Cultural", year: 1979, note: "Medieval Islamic city of mosques, madrasas, hammams and fountains." },
  { name: "Wadi Al-Hitan (Whale Valley)", country: "Egypt", region: "Arab States", category: "Natural", year: 2005, note: "Fossils of archaeocete whales that document the move from land to sea." },
  { name: "Petra", country: "Jordan", region: "Arab States", category: "Cultural", year: 1985, note: "Nabataean caravan city with facades cut into rose-red sandstone cliffs." },
  { name: "Wadi Rum Protected Area", country: "Jordan", region: "Arab States", category: "Mixed", year: 2011, note: "Desert of sandstone valleys with 12,000 years of petroglyphs and inscriptions." },
  { name: "Site of Palmyra", country: "Syria", region: "Arab States", category: "Cultural", year: 1980, note: "Oasis city where Graeco-Roman planning met Persian and local artistic traditions." },
  { name: "Ancient City of Damascus", country: "Syria", region: "Arab States", category: "Cultural", year: 1979, note: "One of the oldest continuously inhabited cities, with the Umayyad Great Mosque." },
  { name: "Ancient City of Aleppo", country: "Syria", region: "Arab States", category: "Cultural", year: 1986, note: "Citadel, covered souqs and caravanserais at a crossroads of trade routes." },
  { name: "Baalbek", country: "Lebanon", region: "Arab States", category: "Cultural", year: 1984, note: "Roman sanctuary with some of the largest temple stones ever quarried." },
  { name: "Byblos", country: "Lebanon", region: "Arab States", category: "Cultural", year: 1984, note: "Port town linked to the diffusion of the Phoenician alphabet." },
  { name: "Medina of Marrakesh", country: "Morocco", region: "Arab States", category: "Cultural", year: 1985, note: "Almoravid capital with the Koutoubia minaret and Jemaa el-Fna square." },
  { name: "Medina of Fez", country: "Morocco", region: "Arab States", category: "Cultural", year: 1981, note: "Founded in the 9th century; home to the al-Qarawiyyin mosque and university." },
  { name: "Ksar of Ait-Ben-Haddou", country: "Morocco", region: "Arab States", category: "Cultural", year: 1987, note: "Fortified earthen village of the pre-Saharan caravan route south of the Atlas." },
  { name: "Amphitheatre of El Jem", country: "Tunisia", region: "Arab States", category: "Cultural", year: 1979, note: "Roman amphitheatre seating around 35,000, built in the early 3rd century." },
  { name: "Site of Carthage", country: "Tunisia", region: "Arab States", category: "Cultural", year: 1979, note: "Punic and Roman remains of the city that fought Rome for the western Mediterranean." },
  { name: "Medina of Tunis", country: "Tunisia", region: "Arab States", category: "Cultural", year: 1979, note: "Almohad and Hafsid capital, one of the great cities of the Islamic world." },
  { name: "Tassili n'Ajjer", country: "Algeria", region: "Arab States", category: "Mixed", year: 1982, note: "Sandstone plateau with over 15,000 rock drawings recording a once-green Sahara." },
  { name: "Timgad", country: "Algeria", region: "Arab States", category: "Cultural", year: 1982, note: "Roman colony of 100 CE laid out on an almost perfect grid." },
  { name: "Archaeological Site of Leptis Magna", country: "Libya", region: "Arab States", category: "Cultural", year: 1982, note: "Coastal city enlarged by the emperor Septimius Severus, who was born there." },

  // --- Asia and the Pacific ---
  { name: "Taj Mahal", country: "India", region: "Asia and the Pacific", category: "Cultural", year: 1983, note: "Marble mausoleum built by Shah Jahan for Mumtaz Mahal, completed in the 1650s." },
  { name: "Ajanta Caves", country: "India", region: "Asia and the Pacific", category: "Cultural", year: 1983, note: "Buddhist rock-cut halls with murals spanning the 2nd century BCE to the 6th century CE." },
  { name: "Ellora Caves", country: "India", region: "Asia and the Pacific", category: "Cultural", year: 1983, note: "Buddhist, Hindu and Jain caves including the monolithic Kailasa temple." },
  { name: "Group of Monuments at Hampi", country: "India", region: "Asia and the Pacific", category: "Cultural", year: 1986, note: "Ruined capital of the Vijayanagara empire on the Tungabhadra river." },
  { name: "Khajuraho Group of Monuments", country: "India", region: "Asia and the Pacific", category: "Cultural", year: 1986, note: "Chandela-period Nagara temples built between about 950 and 1050." },
  { name: "Sundarbans National Park", country: "India", region: "Asia and the Pacific", category: "Natural", year: 1987, note: "Largest mangrove forest on Earth and a stronghold of the Bengal tiger." },
  { name: "Western Ghats", country: "India", region: "Asia and the Pacific", category: "Natural", year: 2012, note: "Mountain chain older than the Himalaya and one of eight global biodiversity hotspots." },
  { name: "Sacred Ensembles of the Hoysalas", country: "India", region: "Asia and the Pacific", category: "Cultural", year: 2023, note: "Belur, Halebidu and Somanathapura temples with soapstone star-plan shrines." },
  { name: "Moidams - the Mound-Burial System of the Ahom Dynasty", country: "India", region: "Asia and the Pacific", category: "Cultural", year: 2024, note: "Ahom royal burial mounds at Charaideo in Assam." },
  { name: "The Great Wall", country: "China", region: "Asia and the Pacific", category: "Cultural", year: 1987, note: "Defensive works begun in the 3rd century BCE and rebuilt through the Ming dynasty." },
  { name: "Imperial Palaces of the Ming and Qing Dynasties", country: "China", region: "Asia and the Pacific", category: "Cultural", year: 1987, note: "The Forbidden City in Beijing and the Mukden Palace in Shenyang." },
  { name: "Mausoleum of the First Qin Emperor", country: "China", region: "Asia and the Pacific", category: "Cultural", year: 1987, note: "Burial complex guarded by thousands of life-size terracotta warriors." },
  { name: "Mogao Caves", country: "China", region: "Asia and the Pacific", category: "Cultural", year: 1987, note: "492 Silk Road cave temples with a thousand years of Buddhist painting." },
  { name: "Mount Taishan", country: "China", region: "Asia and the Pacific", category: "Mixed", year: 1987, note: "Sacred mountain of imperial ritual, inscribed with over a thousand carvings." },
  { name: "Jiuzhaigou Valley Scenic and Historic Interest Area", country: "China", region: "Asia and the Pacific", category: "Natural", year: 1992, note: "Terraced travertine lakes and waterfalls above 2,000 m in northern Sichuan." },
  { name: "Historic Ensemble of the Potala Palace, Lhasa", country: "China", region: "Asia and the Pacific", category: "Cultural", year: 1994, note: "Winter palace of the Dalai Lamas, begun in the 7th century and rebuilt in 1645." },
  { name: "Old Town of Lijiang", country: "China", region: "Asia and the Pacific", category: "Cultural", year: 1997, note: "Naxi town whose water-supply channels still follow the historic layout." },
  { name: "Temple of Heaven", country: "China", region: "Asia and the Pacific", category: "Cultural", year: 1998, note: "Ming imperial sacrificial complex laid out on cosmological principles." },
  { name: "Buddhist Monuments in the Horyu-ji Area", country: "Japan", region: "Asia and the Pacific", category: "Cultural", year: 1993, note: "Includes some of the oldest surviving wooden buildings in the world." },
  { name: "Himeji-jo", country: "Japan", region: "Asia and the Pacific", category: "Cultural", year: 1993, note: "White-plastered hilltop castle of 83 buildings, completed in 1609." },
  { name: "Yakushima", country: "Japan", region: "Asia and the Pacific", category: "Natural", year: 1993, note: "Ancient cedar forest on a subtropical island with dramatic altitudinal zoning." },
  { name: "Historic Monuments of Ancient Kyoto", country: "Japan", region: "Asia and the Pacific", category: "Cultural", year: 1994, note: "Seventeen temples, shrines and a castle across Kyoto, Uji and Otsu." },
  { name: "Hiroshima Peace Memorial (Genbaku Dome)", country: "Japan", region: "Asia and the Pacific", category: "Cultural", year: 1996, note: "Skeletal ruin left standing beneath the 1945 atomic explosion." },
  { name: "Fujisan, sacred place and source of artistic inspiration", country: "Japan", region: "Asia and the Pacific", category: "Cultural", year: 2013, note: "Inscribed for its role in pilgrimage and in art, not for its geology." },
  { name: "Seokguram Grotto and Bulguksa Temple", country: "Republic of Korea", region: "Asia and the Pacific", category: "Cultural", year: 1995, note: "Eighth-century Silla granite grotto with a monumental seated Buddha." },
  { name: "Changdeokgung Palace Complex", country: "Republic of Korea", region: "Asia and the Pacific", category: "Cultural", year: 1997, note: "Joseon palace designed to follow rather than reshape its hillside setting." },
  { name: "Angkor", country: "Cambodia", region: "Asia and the Pacific", category: "Cultural", year: 1992, note: "Khmer capital of the 9th-15th centuries, including Angkor Wat and the Bayon." },
  { name: "Borobudur Temple Compounds", country: "Indonesia", region: "Asia and the Pacific", category: "Cultural", year: 1991, note: "Ninth-century Mahayana stupa-mountain with over 2,600 relief panels." },
  { name: "Prambanan Temple Compounds", country: "Indonesia", region: "Asia and the Pacific", category: "Cultural", year: 1991, note: "Tenth-century Hindu temple group dedicated to the Trimurti." },
  { name: "Komodo National Park", country: "Indonesia", region: "Asia and the Pacific", category: "Natural", year: 1991, note: "Only wild habitat of the Komodo dragon, the largest living lizard." },
  { name: "Historic City of Ayutthaya", country: "Thailand", region: "Asia and the Pacific", category: "Cultural", year: 1991, note: "Siamese capital from 1350 until its destruction in 1767." },
  { name: "Ha Long Bay", country: "Viet Nam", region: "Asia and the Pacific", category: "Natural", year: 1994, note: "About 1,600 limestone karst islands and islets in the Gulf of Tonkin." },
  { name: "Complex of Hue Monuments", country: "Viet Nam", region: "Asia and the Pacific", category: "Cultural", year: 1993, note: "Nguyen dynasty citadel, palaces and royal tombs along the Perfume River." },
  { name: "Ancient City of Sigiriya", country: "Sri Lanka", region: "Asia and the Pacific", category: "Cultural", year: 1982, note: "Fifth-century rock citadel with frescoes and a lion-paw gateway." },
  { name: "Sacred City of Kandy", country: "Sri Lanka", region: "Asia and the Pacific", category: "Cultural", year: 1988, note: "Last Sinhalese royal capital and home of the Temple of the Tooth Relic." },
  { name: "Kathmandu Valley", country: "Nepal", region: "Asia and the Pacific", category: "Cultural", year: 1979, note: "Seven monument zones of Hindu and Buddhist shrines and durbar squares." },
  { name: "Sagarmatha National Park", country: "Nepal", region: "Asia and the Pacific", category: "Natural", year: 1979, note: "Everest and its glaciers, with Sherpa settlements inside the park." },
  { name: "Lumbini, the Birthplace of the Lord Buddha", country: "Nepal", region: "Asia and the Pacific", category: "Cultural", year: 1997, note: "Marked by the Ashokan pillar that records the emperor's visit in 249 BCE." },
  { name: "Archaeological Ruins at Moenjodaro", country: "Pakistan", region: "Asia and the Pacific", category: "Cultural", year: 1980, note: "Indus Valley city of the 3rd millennium BCE with planned drainage and a Great Bath." },
  { name: "Taxila", country: "Pakistan", region: "Asia and the Pacific", category: "Cultural", year: 1980, note: "Successive cities and Buddhist monasteries on a Gandharan crossroads." },
  { name: "Historic Mosque City of Bagerhat", country: "Bangladesh", region: "Asia and the Pacific", category: "Cultural", year: 1985, note: "Fifteenth-century city with the many-domed Shait Gumbad Mosque." },
  { name: "Persepolis", country: "Iran", region: "Asia and the Pacific", category: "Cultural", year: 1979, note: "Achaemenid ceremonial capital founded by Darius I in 518 BCE." },
  { name: "Meidan Emam, Esfahan", country: "Iran", region: "Asia and the Pacific", category: "Cultural", year: 1979, note: "Safavid royal square framed by the Shah and Sheikh Lotfollah mosques." },
  { name: "Itchan Kala", country: "Uzbekistan", region: "Asia and the Pacific", category: "Cultural", year: 1990, note: "Inner walled town of Khiva, the last caravan halt before the desert crossing to Iran." },
  { name: "Samarkand - Crossroad of Cultures", country: "Uzbekistan", region: "Asia and the Pacific", category: "Cultural", year: 2001, note: "Registan ensemble and Timurid monuments on the Silk Road." },
  { name: "Mausoleum of Khoja Ahmed Yasawi", country: "Kazakhstan", region: "Asia and the Pacific", category: "Cultural", year: 2003, note: "Unfinished Timurid mausoleum that served as a laboratory for Persian vaulting." },
  { name: "State Historical and Cultural Park 'Ancient Merv'", country: "Turkmenistan", region: "Asia and the Pacific", category: "Cultural", year: 1999, note: "Oasis cities of the Silk Road spanning four thousand years of settlement." },
  { name: "Orkhon Valley Cultural Landscape", country: "Mongolia", region: "Asia and the Pacific", category: "Cultural", year: 2004, note: "Grassland valley of successive steppe empires, including Karakorum." },
  { name: "Great Barrier Reef", country: "Australia", region: "Asia and the Pacific", category: "Natural", year: 1981, note: "About 2,300 km of coral reef supporting some 1,500 fish species." },
  { name: "Kakadu National Park", country: "Australia", region: "Asia and the Pacific", category: "Mixed", year: 1981, note: "Wetlands and escarpment with rock art recording 20,000 years of occupation." },
  { name: "Uluru-Kata Tjuta National Park", country: "Australia", region: "Asia and the Pacific", category: "Mixed", year: 1987, note: "Sandstone inselberg and domes central to Anangu Tjukurpa law and belief." },
  { name: "Sydney Opera House", country: "Australia", region: "Asia and the Pacific", category: "Cultural", year: 2007, note: "Jorn Utzon's shell-vaulted design, a landmark of 20th-century architecture." },
  { name: "Tongariro National Park", country: "New Zealand", region: "Asia and the Pacific", category: "Mixed", year: 1990, note: "Active volcanoes of deep spiritual significance to the Maori; the first site inscribed for cultural landscape values." },
  { name: "Te Wahipounamu - South West New Zealand", country: "New Zealand", region: "Asia and the Pacific", category: "Natural", year: 1990, note: "Fiords, glaciers and podocarp forest preserving a Gondwanan flora." },

  // --- Europe and North America ---
  { name: "Historic Centre of Rome", country: "Italy and Holy See", region: "Europe and North America", category: "Cultural", year: 1980, note: "Includes the Colosseum, the Pantheon and the properties of the Holy See in Rome." },
  { name: "Venice and its Lagoon", country: "Italy", region: "Europe and North America", category: "Cultural", year: 1987, note: "City founded on 118 islands, a maritime power from the 10th to the 15th century." },
  { name: "Historic Centre of Florence", country: "Italy", region: "Europe and North America", category: "Cultural", year: 1982, note: "Brunelleschi's dome, the Uffizi and the built core of the Renaissance." },
  { name: "Archaeological Areas of Pompei, Herculaneum and Torre Annunziata", country: "Italy", region: "Europe and North America", category: "Cultural", year: 1997, note: "Roman towns sealed by the eruption of Vesuvius in 79 CE." },
  { name: "The Dolomites", country: "Italy", region: "Europe and North America", category: "Natural", year: 2009, note: "Eighteen peaks above 3,000 m in a fossil-rich carbonate mountain landscape." },
  { name: "Mont-Saint-Michel and its Bay", country: "France", region: "Europe and North America", category: "Cultural", year: 1979, note: "Benedictine abbey on a tidal islet in one of Europe's strongest tidal ranges." },
  { name: "Palace and Park of Versailles", country: "France", region: "Europe and North America", category: "Cultural", year: 1979, note: "Seat of French power from 1682 to 1789 and the model for European court palaces." },
  { name: "Chartres Cathedral", country: "France", region: "Europe and North America", category: "Cultural", year: 1979, note: "High Gothic cathedral retaining most of its original 12th-13th century glass." },
  { name: "Paris, Banks of the Seine", country: "France", region: "Europe and North America", category: "Cultural", year: 1991, note: "Riverfront from the Louvre to the Eiffel Tower, including Notre-Dame and the Ile de la Cite." },
  { name: "Historic Fortified City of Carcassonne", country: "France", region: "Europe and North America", category: "Cultural", year: 1997, note: "Double-walled medieval town restored by Viollet-le-Duc in the 19th century." },
  { name: "Alhambra, Generalife and Albayzin, Granada", country: "Spain", region: "Europe and North America", category: "Cultural", year: 1984, note: "Nasrid palace-city and the Moorish quarter facing it across the Darro." },
  { name: "Works of Antoni Gaudi", country: "Spain", region: "Europe and North America", category: "Cultural", year: 1984, note: "Seven Barcelona buildings including the Sagrada Familia nativity facade and crypt." },
  { name: "Historic Centre of Cordoba", country: "Spain", region: "Europe and North America", category: "Cultural", year: 1984, note: "Centred on the Mezquita, later converted into a cathedral." },
  { name: "Santiago de Compostela (Old Town)", country: "Spain", region: "Europe and North America", category: "Cultural", year: 1985, note: "Terminus of the medieval pilgrimage routes across northern Spain." },
  { name: "Stonehenge, Avebury and Associated Sites", country: "United Kingdom", region: "Europe and North America", category: "Cultural", year: 1986, note: "Neolithic and Bronze Age megalithic monuments and their surrounding landscape." },
  { name: "City of Bath", country: "United Kingdom", region: "Europe and North America", category: "Cultural", year: 1987, note: "Roman baths beneath a Georgian city of crescents and Bath stone terraces." },
  { name: "Tower of London", country: "United Kingdom", region: "Europe and North America", category: "Cultural", year: 1988, note: "Norman fortress begun by William the Conqueror around 1078." },
  { name: "Giant's Causeway and Causeway Coast", country: "United Kingdom", region: "Europe and North America", category: "Natural", year: 1986, note: "About 40,000 interlocking basalt columns from a Palaeogene lava flow." },
  { name: "Old and New Towns of Edinburgh", country: "United Kingdom", region: "Europe and North America", category: "Cultural", year: 1995, note: "Medieval Old Town beside a neoclassical Georgian New Town." },
  { name: "Acropolis, Athens", country: "Greece", region: "Europe and North America", category: "Cultural", year: 1987, note: "Parthenon, Erechtheion and Propylaia built under Pericles in the 5th century BCE." },
  { name: "Archaeological Site of Delphi", country: "Greece", region: "Europe and North America", category: "Cultural", year: 1987, note: "Sanctuary of Apollo and the seat of the most consulted oracle in the Greek world." },
  { name: "Meteora", country: "Greece", region: "Europe and North America", category: "Mixed", year: 1988, note: "Byzantine monasteries perched on sandstone pillars in Thessaly." },
  { name: "Historic Areas of Istanbul", country: "Turkiye", region: "Europe and North America", category: "Cultural", year: 1985, note: "Hagia Sophia, the Blue Mosque, Topkapi and the Theodosian land walls." },
  { name: "Goreme National Park and the Rock Sites of Cappadocia", country: "Turkiye", region: "Europe and North America", category: "Mixed", year: 1985, note: "Tuff landscape of fairy chimneys with rock-cut churches and underground cities." },
  { name: "Gobekli Tepe", country: "Turkiye", region: "Europe and North America", category: "Cultural", year: 2018, note: "Monumental T-shaped pillars raised by hunter-gatherers around 9600-8200 BCE." },
  { name: "Historic Centre of Prague", country: "Czechia", region: "Europe and North America", category: "Cultural", year: 1992, note: "Castle, Charles Bridge and Old Town across a millennium of building." },
  { name: "Budapest, including the Banks of the Danube and Andrassy Avenue", country: "Hungary", region: "Europe and North America", category: "Cultural", year: 1987, note: "Buda Castle hill facing the Pest embankment across the Danube." },
  { name: "Auschwitz Birkenau German Nazi Concentration and Extermination Camp", country: "Poland", region: "Europe and North America", category: "Cultural", year: 1979, note: "Preserved as evidence of the Holocaust and a memorial to its victims." },
  { name: "Kremlin and Red Square, Moscow", country: "Russian Federation", region: "Europe and North America", category: "Cultural", year: 1990, note: "Fortified centre of Russian power with St Basil's Cathedral on the square." },
  { name: "Historic Centre of Saint Petersburg", country: "Russian Federation", region: "Europe and North America", category: "Cultural", year: 1990, note: "Planned imperial capital of canals, palaces and the Winter Palace ensemble." },
  { name: "Lake Baikal", country: "Russian Federation", region: "Europe and North America", category: "Natural", year: 1996, note: "Oldest and deepest lake on Earth, holding about 20% of unfrozen fresh water." },
  { name: "Kyiv: Saint-Sophia Cathedral and Kyiv-Pechersk Lavra", country: "Ukraine", region: "Europe and North America", category: "Cultural", year: 1990, note: "Eleventh-century cathedral and cave monastery of Kyivan Rus." },
  { name: "Old City of Dubrovnik", country: "Croatia", region: "Europe and North America", category: "Cultural", year: 1979, note: "Walled Adriatic maritime republic, largely rebuilt after the 1667 earthquake." },
  { name: "Plitvice Lakes National Park", country: "Croatia", region: "Europe and North America", category: "Natural", year: 1979, note: "Sixteen terraced lakes linked by travertine barriers that are still growing." },
  { name: "Old Bridge Area of the Old City of Mostar", country: "Bosnia and Herzegovina", region: "Europe and North America", category: "Cultural", year: 2005, note: "Ottoman bridge of 1566, destroyed in 1993 and rebuilt in 2004." },
  { name: "Natural and Culturo-Historical Region of Kotor", country: "Montenegro", region: "Europe and North America", category: "Cultural", year: 1979, note: "Fortified town at the head of a deep Adriatic bay." },
  { name: "Historic Centre of Vienna", country: "Austria", region: "Europe and North America", category: "Cultural", year: 2001, note: "Medieval core, Baroque palaces and the 19th-century Ringstrasse." },
  { name: "Old City of Bern", country: "Switzerland", region: "Europe and North America", category: "Cultural", year: 1983, note: "Medieval town of arcaded streets and fountains in an Aare river loop." },
  { name: "Swiss Alps Jungfrau-Aletsch", country: "Switzerland", region: "Europe and North America", category: "Natural", year: 2001, note: "The Aletsch Glacier, the largest in the Alps, in a classic high-alpine setting." },
  { name: "Cologne Cathedral", country: "Germany", region: "Europe and North America", category: "Cultural", year: 1996, note: "Gothic cathedral begun in 1248 and completed to the original plans in 1880." },
  { name: "Museumsinsel (Museum Island), Berlin", country: "Germany", region: "Europe and North America", category: "Cultural", year: 1999, note: "Five museums built 1824-1930 that together define the modern museum." },
  { name: "Wadden Sea", country: "Netherlands, Germany and Denmark", region: "Europe and North America", category: "Natural", year: 2009, note: "The largest unbroken system of intertidal sand and mud flats in the world." },
  { name: "Seventeenth-Century Canal Ring Area of Amsterdam", country: "Netherlands", region: "Europe and North America", category: "Cultural", year: 2010, note: "Planned Golden Age extension of concentric canals and merchant houses." },
  { name: "Historic Centre of Bruges", country: "Belgium", region: "Europe and North America", category: "Cultural", year: 2000, note: "Medieval trading city whose brick Gothic fabric survives largely intact." },
  { name: "Monastery of the Hieronymites and Tower of Belem in Lisbon", country: "Portugal", region: "Europe and North America", category: "Cultural", year: 1983, note: "Manueline monuments marking Portugal's age of maritime exploration." },
  { name: "Laurisilva of Madeira", country: "Portugal", region: "Europe and North America", category: "Natural", year: 1999, note: "Largest surviving laurel forest, a relic of a once-widespread Tertiary flora." },
  { name: "Bryggen", country: "Norway", region: "Europe and North America", category: "Cultural", year: 1979, note: "Wooden Hanseatic wharf buildings on Bergen's harbour front." },
  { name: "West Norwegian Fjords - Geirangerfjord and Naeroyfjord", country: "Norway", region: "Europe and North America", category: "Natural", year: 2005, note: "Glacially carved fjords up to 500 m deep with near-vertical rock walls." },
  { name: "Fortress of Suomenlinna", country: "Finland", region: "Europe and North America", category: "Cultural", year: 1991, note: "Eighteenth-century sea fortress spread across islands off Helsinki." },
  { name: "Surtsey", country: "Iceland", region: "Europe and North America", category: "Natural", year: 2008, note: "Island created by eruption in 1963-67 and left untouched for scientific study." },
  { name: "Bru na Boinne - Archaeological Ensemble of the Bend of the Boyne", country: "Ireland", region: "Europe and North America", category: "Cultural", year: 1993, note: "Newgrange, Knowth and Dowth passage tombs, older than the Egyptian pyramids." },
  { name: "Historic Centre of Tallinn", country: "Estonia", region: "Europe and North America", category: "Cultural", year: 1997, note: "Hanseatic town whose medieval street plan and walls survive nearly complete." },
  { name: "Grand Canyon National Park", country: "United States", region: "Europe and North America", category: "Natural", year: 1979, note: "Colorado River gorge exposing about two billion years of geological history." },
  { name: "Statue of Liberty", country: "United States", region: "Europe and North America", category: "Cultural", year: 1984, note: "Bartholdi's 1886 colossus, engineered with an iron frame by Gustave Eiffel." },
  { name: "Yosemite National Park", country: "United States", region: "Europe and North America", category: "Natural", year: 1984, note: "Granite domes, waterfalls and groves of giant sequoia in the Sierra Nevada." },
  { name: "Chaco Culture", country: "United States", region: "Europe and North America", category: "Cultural", year: 1987, note: "Ancestral Puebloan great houses aligned to solar and lunar cycles." },
  { name: "Canadian Rocky Mountain Parks", country: "Canada", region: "Europe and North America", category: "Natural", year: 1984, note: "Banff, Jasper, Kootenay and Yoho, including the Burgess Shale fossil beds." },
  { name: "Historic District of Old Quebec", country: "Canada", region: "Europe and North America", category: "Cultural", year: 1985, note: "Only fortified city north of Mexico with its walls still standing." },

  // --- Latin America and the Caribbean ---
  { name: "Historic Sanctuary of Machu Picchu", country: "Peru", region: "Latin America and the Caribbean", category: "Mixed", year: 1983, note: "Inca estate at 2,430 m, unknown to the outside world until 1911." },
  { name: "City of Cuzco", country: "Peru", region: "Latin America and the Caribbean", category: "Cultural", year: 1983, note: "Inca capital rebuilt as a Spanish colonial city on Inca foundations." },
  { name: "Lines and Geoglyphs of Nasca and Palpa", country: "Peru", region: "Latin America and the Caribbean", category: "Cultural", year: 1994, note: "Desert geoglyphs made between 500 BCE and 500 CE, some hundreds of metres across." },
  { name: "Chan Chan Archaeological Zone", country: "Peru", region: "Latin America and the Caribbean", category: "Cultural", year: 1986, note: "Largest adobe city in the Americas, capital of the Chimu kingdom." },
  { name: "Pre-Hispanic City of Teotihuacan", country: "Mexico", region: "Latin America and the Caribbean", category: "Cultural", year: 1987, note: "Pyramids of the Sun and Moon on the Avenue of the Dead, laid out from 100 BCE." },
  { name: "Pre-Hispanic City of Chichen-Itza", country: "Mexico", region: "Latin America and the Caribbean", category: "Cultural", year: 1988, note: "Maya-Toltec city with El Castillo, a pyramid encoding the 365-day calendar." },
  { name: "Historic Centre of Mexico City and Xochimilco", country: "Mexico", region: "Latin America and the Caribbean", category: "Cultural", year: 1987, note: "Colonial capital built over Tenochtitlan, plus the Aztec canal gardens." },
  { name: "Pre-Hispanic City and National Park of Palenque", country: "Mexico", region: "Latin America and the Caribbean", category: "Cultural", year: 1987, note: "Classic Maya city whose Temple of the Inscriptions holds Pakal's tomb." },
  { name: "Sian Ka'an", country: "Mexico", region: "Latin America and the Caribbean", category: "Natural", year: 1987, note: "Coastal reserve of forest, mangrove and barrier reef on the Yucatan." },
  { name: "Tikal National Park", country: "Guatemala", region: "Latin America and the Caribbean", category: "Mixed", year: 1979, note: "Maya city in rainforest, inscribed for both its ruins and its ecosystem." },
  { name: "Antigua Guatemala", country: "Guatemala", region: "Latin America and the Caribbean", category: "Cultural", year: 1979, note: "Spanish colonial capital abandoned after the earthquakes of 1773." },
  { name: "Maya Site of Copan", country: "Honduras", region: "Latin America and the Caribbean", category: "Cultural", year: 1980, note: "Hieroglyphic Stairway carrying the longest known Maya inscription." },
  { name: "Brasilia", country: "Brazil", region: "Latin America and the Caribbean", category: "Cultural", year: 1987, note: "Capital built from nothing in 1956-60 to Lucio Costa's plan with Niemeyer's buildings." },
  { name: "Historic Town of Ouro Preto", country: "Brazil", region: "Latin America and the Caribbean", category: "Cultural", year: 1980, note: "Gold-rush town of Brazilian Baroque, with churches carved by Aleijadinho." },
  { name: "Iguacu National Park", country: "Brazil", region: "Latin America and the Caribbean", category: "Natural", year: 1986, note: "Waterfall system of some 275 drops, twinned with Argentina's Iguazu NP (1984)." },
  { name: "Rio de Janeiro: Carioca Landscapes between the Mountain and the Sea", country: "Brazil", region: "Latin America and the Caribbean", category: "Cultural", year: 2012, note: "Inscribed as an urban cultural landscape, from Tijuca forest to Copacabana." },
  { name: "Los Glaciares National Park", country: "Argentina", region: "Latin America and the Caribbean", category: "Natural", year: 1981, note: "Patagonian ice field feeding the advancing Perito Moreno glacier." },
  { name: "Cueva de las Manos, Rio Pinturas", country: "Argentina", region: "Latin America and the Caribbean", category: "Cultural", year: 1999, note: "Stencilled handprints painted between about 9,500 and 1,300 years ago." },
  { name: "Rapa Nui National Park", country: "Chile", region: "Latin America and the Caribbean", category: "Cultural", year: 1995, note: "Easter Island's moai, carved between roughly 1250 and 1500 CE." },
  { name: "Old Havana and its Fortification System", country: "Cuba", region: "Latin America and the Caribbean", category: "Cultural", year: 1982, note: "Baroque and neoclassical colonial city guarding a strategic Caribbean harbour." },
  { name: "Port, Fortresses and Group of Monuments, Cartagena", country: "Colombia", region: "Latin America and the Caribbean", category: "Cultural", year: 1984, note: "Most extensive fortifications in South America, built against Caribbean raiders." },
  { name: "Coffee Cultural Landscape of Colombia", country: "Colombia", region: "Latin America and the Caribbean", category: "Cultural", year: 2011, note: "Smallholder coffee farming on steep Andean slopes across six regions." },
  { name: "Belize Barrier Reef Reserve System", country: "Belize", region: "Latin America and the Caribbean", category: "Natural", year: 1996, note: "Largest reef system in the northern hemisphere, including the Great Blue Hole." },
  { name: "Colonial City of Santo Domingo", country: "Dominican Republic", region: "Latin America and the Caribbean", category: "Cultural", year: 1990, note: "First European city in the Americas, founded in 1498 on a grid plan." },
  { name: "National History Park - Citadel, Sans Souci, Ramiers", country: "Haiti", region: "Latin America and the Caribbean", category: "Cultural", year: 1982, note: "Built after independence in 1804 as symbols of the first free Black republic." },
];

export const SORTS = [
  { id: "name", label: "Name (A-Z)" },
  { id: "year-asc", label: "Year inscribed (oldest first)" },
  { id: "year-desc", label: "Year inscribed (newest first)" },
  { id: "country", label: "Country (A-Z)" },
];

const collator = new Intl.Collator("en", { sensitivity: "base" });

/** Sorted list of countries (as printed on the List entry) present in the dataset. */
export function listCountries() {
  return Array.from(new Set(SITES.map((site) => site.country))).sort((a, b) =>
    collator.compare(a, b),
  );
}

/** The decade bucket a year falls into, e.g. 1987 -> 1980. */
export function decadeOf(year) {
  if (!Number.isFinite(year)) return null;
  return Math.floor(year / 10) * 10;
}

function matchesQuery(site, needle) {
  if (!needle) return true;
  return [site.name, site.country, site.region, site.category, site.note]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

/**
 * Filter and sort the site list.
 * Returns { items, total } or { error, items: [], total: 0 } for invalid input.
 */
export function filterSites({
  query = "",
  country = "all",
  region = "all",
  category = "all",
  yearFrom = FIRST_INSCRIPTION_YEAR,
  yearTo = LATEST_DATA_YEAR,
  sort = "name",
} = {}) {
  const needle = String(query ?? "").trim().toLowerCase();
  if (needle.length > 80) {
    return { error: "Search text is too long — try a shorter keyword.", items: [], total: 0 };
  }

  const from = Number(yearFrom);
  const to = Number(yearTo);
  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    return { error: "Enter whole years for the inscription range.", items: [], total: 0 };
  }
  if (from < FIRST_INSCRIPTION_YEAR || to < FIRST_INSCRIPTION_YEAR) {
    return {
      error: `The first World Heritage inscriptions were made in ${FIRST_INSCRIPTION_YEAR}.`,
      items: [],
      total: 0,
    };
  }
  if (from > LATEST_DATA_YEAR || to > LATEST_DATA_YEAR) {
    return {
      error: `This dataset covers inscriptions up to ${LATEST_DATA_YEAR}.`,
      items: [],
      total: 0,
    };
  }
  if (from > to) {
    return { error: "The start year must not be later than the end year.", items: [], total: 0 };
  }
  if (region !== "all" && !REGIONS.includes(region)) {
    return { error: "Unknown UNESCO region selected.", items: [], total: 0 };
  }
  if (category !== "all" && !CATEGORIES.some((entry) => entry.id === category)) {
    return { error: "Unknown inscription category selected.", items: [], total: 0 };
  }

  const items = SITES.filter((site) => {
    if (country !== "all" && site.country !== country) return false;
    if (region !== "all" && site.region !== region) return false;
    if (category !== "all" && site.category !== category) return false;
    if (site.year < from || site.year > to) return false;
    return matchesQuery(site, needle);
  });

  const sorted = items.slice().sort((a, b) => {
    if (sort === "year-asc") return a.year - b.year || collator.compare(a.name, b.name);
    if (sort === "year-desc") return b.year - a.year || collator.compare(a.name, b.name);
    if (sort === "country") {
      return collator.compare(a.country, b.country) || collator.compare(a.name, b.name);
    }
    return collator.compare(a.name, b.name);
  });

  return { items: sorted, total: sorted.length };
}

/** Category, country and decade breakdown for a result set. */
export function summarise(items = []) {
  const list = Array.isArray(items) ? items : [];
  const byCategory = { Cultural: 0, Natural: 0, Mixed: 0 };
  const countries = new Set();
  const byDecade = new Map();
  let earliest = null;
  let latest = null;

  for (const site of list) {
    if (byCategory[site.category] !== undefined) byCategory[site.category] += 1;
    countries.add(site.country);
    const decade = decadeOf(site.year);
    byDecade.set(decade, (byDecade.get(decade) || 0) + 1);
    if (earliest === null || site.year < earliest) earliest = site.year;
    if (latest === null || site.year > latest) latest = site.year;
  }

  const decades = Array.from(byDecade.entries())
    .map(([decade, count]) => ({ decade, count }))
    .sort((a, b) => a.decade - b.decade);

  return {
    count: list.length,
    countries: countries.size,
    byCategory,
    decades,
    earliest,
    latest,
    culturalShare: list.length > 0 ? (byCategory.Cultural / list.length) * 100 : 0,
  };
}
