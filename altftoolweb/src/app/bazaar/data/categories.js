/**
 * AltF Bazaar — category taxonomy.
 *
 * Server-safe and synchronously importable: `sitemap.js` pulls this in at
 * module scope, so nothing here may touch `window`, Firebase, or async I/O.
 *
 * Shape notes:
 * - `icon` is a lucide icon NAME (string). Components map it through
 *   `components/categoryIcons.js` so the data stays serialisable and the
 *   icon set stays tree-shakeable.
 * - `attributes` drive both the filter rail on listing pages and the
 *   "Post an ad" wizard's detail step. One definition, two surfaces.
 * - `priceBand` is [min, max] in the market currency (rupees for the default
 *   market — see `data/market.js`). It seeds the price sliders and the
 *   deterministic listing generator in `listings.js`.
 */

import { getMarket } from "./market";

/** Attribute field types understood by the filter rail and the post wizard. */
export const ATTRIBUTE_TYPES = {
  SELECT: "select",
  RANGE: "range",
  TOGGLE: "toggle",
  TEXT: "text",
};

const OWNERS = ["1st owner", "2nd owner", "3rd owner", "4th owner or more"];
const FURNISHING = ["Furnished", "Semi-furnished", "Unfurnished"];
const LISTED_BY = ["Owner", "Dealer", "Builder"];
const CONDITION = ["New", "Like new", "Good", "Fair", "For parts"];
const YEAR_RANGE = {
  key: "year",
  label: "Year",
  type: ATTRIBUTE_TYPES.RANGE,
  min: 2005,
  max: 2026,
};
const CONDITION_SELECT = {
  key: "condition",
  label: "Condition",
  type: ATTRIBUTE_TYPES.SELECT,
  options: CONDITION,
};
const WARRANTY_TOGGLE = {
  key: "warranty",
  label: "Under warranty",
  type: ATTRIBUTE_TYPES.TOGGLE,
};

export const CATEGORIES = [
  {
    slug: "cars",
    name: "Cars",
    icon: "Car",
    tagline: "Hatchbacks, sedans, SUVs and everything between",
    description:
      "Buy and sell used cars near you. Compare kilometres driven, ownership history and service records before you commit.",
    priceBand: [45000, 4500000],
    attributes: [
      {
        key: "brand",
        label: "Brand",
        type: ATTRIBUTE_TYPES.SELECT,
        options: [
          "Maruti Suzuki",
          "Hyundai",
          "Tata",
          "Mahindra",
          "Honda",
          "Toyota",
          "Kia",
          "Volkswagen",
          "Skoda",
          "Renault",
          "MG",
          "BMW",
          "Mercedes-Benz",
          "Audi",
        ],
      },
      YEAR_RANGE,
      {
        key: "fuel",
        label: "Fuel",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Petrol", "Diesel", "CNG", "Electric", "Hybrid", "LPG"],
      },
      {
        key: "transmission",
        label: "Transmission",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Manual", "Automatic"],
      },
      {
        key: "kmDriven",
        label: "KM driven",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 0,
        max: 250000,
        unit: "km",
      },
      {
        key: "owners",
        label: "Number of owners",
        type: ATTRIBUTE_TYPES.SELECT,
        options: OWNERS,
      },
      { key: "insurance", label: "Insurance valid", type: ATTRIBUTE_TYPES.TOGGLE },
      { key: "inspected", label: "Inspected only", type: ATTRIBUTE_TYPES.TOGGLE },
    ],
    subcategories: [
      { slug: "hatchback", name: "Hatchback" },
      { slug: "sedan", name: "Sedan" },
      { slug: "suv", name: "SUV" },
      { slug: "muv-mpv", name: "MUV & MPV" },
      { slug: "luxury-cars", name: "Luxury Cars" },
      { slug: "electric-cars", name: "Electric Cars" },
      { slug: "vintage-classic-cars", name: "Vintage & Classic Cars" },
      { slug: "car-accessories", name: "Car Accessories" },
      { slug: "other-vehicles", name: "Other Vehicles" },
    ],
  },
  {
    slug: "properties",
    name: "Properties",
    icon: "Building2",
    tagline: "Rent, buy or list a home, shop or plot",
    description:
      "Flats, houses, plots, PGs and commercial space listed directly by owners, builders and agents.",
    priceBand: [4000, 90000000],
    attributes: [
      {
        key: "listingType",
        label: "Listing type",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["For sale", "For rent", "PG & co-living"],
      },
      {
        key: "bhk",
        label: "Bedrooms",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"],
      },
      {
        key: "bathrooms",
        label: "Bathrooms",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["1", "2", "3", "4+"],
      },
      {
        key: "furnishing",
        label: "Furnishing",
        type: ATTRIBUTE_TYPES.SELECT,
        options: FURNISHING,
      },
      {
        key: "listedBy",
        label: "Listed by",
        type: ATTRIBUTE_TYPES.SELECT,
        options: LISTED_BY,
      },
      {
        key: "carpetArea",
        label: "Carpet area",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 200,
        max: 6000,
        unit: "sqft",
      },
      {
        key: "facing",
        label: "Facing",
        type: ATTRIBUTE_TYPES.SELECT,
        options: [
          "East",
          "West",
          "North",
          "South",
          "North-East",
          "North-West",
          "South-East",
          "South-West",
        ],
      },
      { key: "parking", label: "Car parking", type: ATTRIBUTE_TYPES.TOGGLE },
      {
        key: "constructionStatus",
        label: "Construction status",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["New launch", "Under construction", "Ready to move"],
      },
      {
        key: "superBuiltupArea",
        label: "Super builtup area",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 300,
        max: 8000,
        unit: "sqft",
      },
      {
        key: "totalFloors",
        label: "Total floors",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["1 to 5", "6 to 10", "11 to 20", "20+"],
      },
      {
        key: "bachelorsAllowed",
        label: "Bachelors allowed",
        type: ATTRIBUTE_TYPES.TOGGLE,
      },
    ],
    subcategories: [
      { slug: "for-sale-houses-apartments", name: "For Sale: Houses & Apartments" },
      { slug: "for-sale-new-projects", name: "For Sale: New Projects & Properties" },
      { slug: "for-rent-houses-apartments", name: "For Rent: Houses & Apartments" },
      { slug: "lands-plots", name: "Lands & Plots" },
      { slug: "for-rent-shops-offices", name: "For Rent: Shops & Offices" },
      { slug: "for-sale-shops-offices", name: "For Sale: Shops & Offices" },
      { slug: "pg-guest-houses", name: "PG & Guest Houses" },
      { slug: "farmhouses-villas", name: "Farmhouses & Villas" },
      { slug: "warehouses-godowns", name: "Warehouses & Godowns" },
    ],
  },
  {
    slug: "mobiles",
    name: "Mobiles",
    icon: "Smartphone",
    tagline: "Phones, tablets, wearables and accessories",
    description:
      "Second-hand smartphones and tablets with condition grades, warranty status and original-bill details.",
    priceBand: [500, 180000],
    attributes: [
      {
        key: "brand",
        label: "Brand",
        type: ATTRIBUTE_TYPES.SELECT,
        options: [
          "Apple",
          "Samsung",
          "Xiaomi",
          "OnePlus",
          "Realme",
          "Vivo",
          "Oppo",
          "Google",
          "Nothing",
          "Motorola",
          "iQOO",
          "Poco",
        ],
      },
      CONDITION_SELECT,
      {
        key: "storage",
        label: "Storage",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB"],
      },
      {
        key: "ram",
        label: "RAM",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["3 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB"],
      },
      WARRANTY_TOGGLE,
      { key: "bill", label: "Original bill available", type: ATTRIBUTE_TYPES.TOGGLE },
    ],
    subcategories: [
      { slug: "mobile-phones", name: "Mobile Phones" },
      { slug: "accessories", name: "Accessories" },
      { slug: "tablets", name: "Tablets" },
      { slug: "smart-watches", name: "Smart Watches" },
      { slug: "mobile-repair-services", name: "Mobile Repair & Services" },
    ],
  },
  {
    slug: "bikes",
    name: "Bikes",
    icon: "Bike",
    tagline: "Motorcycles, scooters and cycles",
    description:
      "Two-wheelers from daily commuters to superbikes, with kilometres, ownership and RC transfer status up front.",
    priceBand: [2000, 2500000],
    attributes: [
      {
        key: "brand",
        label: "Brand",
        type: ATTRIBUTE_TYPES.SELECT,
        options: [
          "Hero",
          "Honda",
          "Bajaj",
          "TVS",
          "Royal Enfield",
          "Yamaha",
          "Suzuki",
          "KTM",
          "Ola Electric",
          "Ather",
          "Jawa",
          "Harley-Davidson",
        ],
      },
      YEAR_RANGE,
      {
        key: "kmDriven",
        label: "KM driven",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 0,
        max: 120000,
        unit: "km",
      },
      {
        key: "engineCc",
        label: "Engine",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 50,
        max: 1800,
        unit: "cc",
      },
      {
        key: "owners",
        label: "Number of owners",
        type: ATTRIBUTE_TYPES.SELECT,
        options: OWNERS,
      },
    ],
    subcategories: [
      { slug: "motorcycles", name: "Motorcycles" },
      { slug: "scooters", name: "Scooters" },
      { slug: "electric-two-wheelers", name: "Electric Two-Wheelers" },
      { slug: "bicycles", name: "Bicycles" },
      { slug: "spare-parts", name: "Spare Parts" },
    ],
  },
  {
    slug: "electronics-appliances",
    name: "Electronics & Appliances",
    icon: "Tv",
    tagline: "TVs, laptops, ACs, fridges and more",
    description:
      "Home and personal electronics listed with age, warranty status and honest working condition.",
    priceBand: [900, 400000],
    attributes: [
      CONDITION_SELECT,
      {
        key: "ageYears",
        label: "Age",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 0,
        max: 12,
        unit: "yrs",
      },
      WARRANTY_TOGGLE,
      {
        key: "brand",
        label: "Brand",
        type: ATTRIBUTE_TYPES.SELECT,
        options: [
          "Samsung",
          "LG",
          "Sony",
          "Whirlpool",
          "Voltas",
          "Daikin",
          "Dell",
          "HP",
          "Lenovo",
          "Apple",
          "Asus",
          "Bosch",
          "Philips",
        ],
      },
    ],
    subcategories: [
      { slug: "tvs-video-audio", name: "TVs, Video & Audio" },
      { slug: "computers-laptops", name: "Computers & Laptops" },
      { slug: "acs", name: "ACs" },
      { slug: "fridges", name: "Fridges" },
      { slug: "washing-machines", name: "Washing Machines" },
      { slug: "kitchen-appliances", name: "Kitchen & Other Appliances" },
      { slug: "cameras-lenses", name: "Cameras & Lenses" },
      { slug: "computer-accessories", name: "Computer Accessories" },
      {
        slug: "hard-disks-printers-monitors",
        name: "Hard Disks, Printers & Monitors",
      },
      { slug: "games-entertainment", name: "Games & Entertainment" },
    ],
  },
  {
    slug: "jobs",
    name: "Jobs",
    icon: "BriefcaseBusiness",
    tagline: "Local roles, shifts and gigs near you",
    description:
      "Full-time, part-time and contract roles posted by local employers, with salary bands stated up front.",
    priceBand: [8000, 250000],
    attributes: [
      {
        key: "salaryPeriod",
        label: "Salary period",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Hourly", "Daily", "Weekly", "Monthly", "Yearly"],
      },
      {
        key: "positionType",
        label: "Position type",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Full-time", "Part-time", "Contract", "Temporary", "Internship"],
      },
      {
        key: "experience",
        label: "Experience",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Fresher", "0-1 years", "1-3 years", "3-5 years", "5+ years"],
      },
      {
        key: "workMode",
        label: "Work mode",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["On-site", "Hybrid", "Remote"],
      },
    ],
    subcategories: [
      { slug: "data-entry-back-office", name: "Data Entry & Back Office" },
      { slug: "sales-marketing", name: "Sales & Marketing" },
      { slug: "bpo-telecaller", name: "BPO & Telecaller" },
      { slug: "driver", name: "Driver" },
      { slug: "office-assistant", name: "Office Assistant" },
      { slug: "delivery-collection", name: "Delivery & Collection" },
      { slug: "teacher", name: "Teacher" },
      { slug: "cook", name: "Cook" },
      { slug: "receptionist-front-office", name: "Receptionist & Front Office" },
      { slug: "operator-technician", name: "Operator & Technician" },
      { slug: "it-engineer-developer", name: "IT Engineer & Developer" },
      { slug: "hotel-travel-executive", name: "Hotel & Travel Executive" },
      { slug: "accountant", name: "Accountant" },
      { slug: "designer", name: "Designer" },
      { slug: "security-guard", name: "Security Guard" },
      { slug: "housekeeping", name: "Housekeeping" },
      { slug: "other-jobs", name: "Other Jobs" },
    ],
  },
  {
    slug: "commercial-vehicles-spares",
    name: "Commercial Vehicles & Spares",
    icon: "Truck",
    tagline: "Trucks, buses, tractors and parts",
    description:
      "Commercial transport and farm vehicles with load capacity, permit status and service history.",
    priceBand: [25000, 6000000],
    attributes: [
      YEAR_RANGE,
      {
        key: "kmDriven",
        label: "KM driven",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 0,
        max: 500000,
        unit: "km",
      },
      {
        key: "owners",
        label: "Number of owners",
        type: ATTRIBUTE_TYPES.SELECT,
        options: OWNERS,
      },
      {
        key: "loadCapacity",
        label: "Load capacity",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 500,
        max: 40000,
        unit: "kg",
      },
      { key: "permit", label: "National permit", type: ATTRIBUTE_TYPES.TOGGLE },
    ],
    subcategories: [
      { slug: "commercial-heavy-vehicles", name: "Commercial & Heavy Vehicles" },
      { slug: "vehicle-spare-parts", name: "Vehicle Spare Parts" },
      { slug: "commercial-heavy-machinery", name: "Commercial & Heavy Machinery" },
      { slug: "tractors", name: "Tractors" },
      { slug: "auto-rickshaws-taxis", name: "Auto Rickshaws & Taxis" },
      { slug: "buses-vans", name: "Buses & Vans" },
    ],
  },
  {
    slug: "furniture",
    name: "Furniture",
    icon: "Sofa",
    tagline: "Sofas, beds, wardrobes and decor",
    description:
      "Home and office furniture with material, dimensions and condition listed so delivery is never a surprise.",
    priceBand: [500, 250000],
    attributes: [
      CONDITION_SELECT,
      {
        key: "material",
        label: "Material",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Solid wood", "Engineered wood", "Metal", "Plastic", "Cane & bamboo", "Glass"],
      },
      {
        key: "ageYears",
        label: "Age",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 0,
        max: 20,
        unit: "yrs",
      },
      { key: "delivery", label: "Delivery available", type: ATTRIBUTE_TYPES.TOGGLE },
    ],
    subcategories: [
      { slug: "sofa-dining", name: "Sofa & Dining" },
      { slug: "beds-wardrobes", name: "Beds & Wardrobes" },
      { slug: "home-decor-garden", name: "Home Decor & Garden" },
      { slug: "kids-furniture", name: "Kids Furniture" },
      { slug: "office-furniture", name: "Office Furniture" },
      { slug: "mattresses", name: "Mattresses" },
      { slug: "curtains-furnishing", name: "Curtains & Furnishing" },
      { slug: "other-household-items", name: "Other Household Items" },
    ],
  },
  {
    slug: "fashion",
    name: "Fashion",
    icon: "Shirt",
    tagline: "Clothing, footwear, watches and bags",
    description:
      "Pre-loved and unused fashion with size, brand and wear condition stated clearly.",
    priceBand: [300, 300000],
    attributes: [
      CONDITION_SELECT,
      {
        key: "gender",
        label: "For",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Men", "Women", "Unisex", "Kids"],
      },
      {
        key: "size",
        label: "Size",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["XS", "S", "M", "L", "XL", "XXL", "Free size"],
      },
    ],
    subcategories: [
      { slug: "mens-fashion", name: "Men's Fashion" },
      { slug: "womens-fashion", name: "Women's Fashion" },
      { slug: "kids-fashion", name: "Kids' Fashion" },
      { slug: "footwear", name: "Footwear" },
      { slug: "watches", name: "Watches" },
      { slug: "bags-luggage", name: "Bags & Luggage" },
      { slug: "jewellery", name: "Jewellery" },
      { slug: "ethnic-wear", name: "Ethnic & Wedding Wear" },
    ],
  },
  {
    slug: "books-sports-hobbies",
    name: "Books, Sports & Hobbies",
    icon: "BookOpen",
    tagline: "Books, gear, instruments and collectibles",
    description:
      "Textbooks, fitness gear, musical instruments and hobby kits from people nearby.",
    priceBand: [400, 200000],
    attributes: [
      CONDITION_SELECT,
      {
        key: "language",
        label: "Language",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Bengali", "Other"],
      },
    ],
    subcategories: [
      { slug: "books", name: "Books" },
      { slug: "gym-fitness", name: "Gym & Fitness" },
      { slug: "musical-instruments", name: "Musical Instruments" },
      { slug: "sports-equipment", name: "Sports Equipment" },
      { slug: "other-hobbies", name: "Other Hobbies" },
      { slug: "board-games-puzzles", name: "Board Games & Puzzles" },
      { slug: "cycling-gear", name: "Cycling Gear" },
    ],
  },
  {
    slug: "pets",
    name: "Pets",
    icon: "PawPrint",
    tagline: "Pets, accessories and pet care",
    description:
      "Responsible rehoming, pet accessories and food. Every listing carries AltF Bazaar's animal-welfare notice.",
    priceBand: [200, 150000],
    attributes: [
      {
        key: "petAge",
        label: "Age",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 0,
        max: 15,
        unit: "yrs",
      },
      { key: "vaccinated", label: "Vaccinated", type: ATTRIBUTE_TYPES.TOGGLE },
      { key: "pedigree", label: "Pedigree certificate", type: ATTRIBUTE_TYPES.TOGGLE },
    ],
    subcategories: [
      { slug: "fishes-aquarium", name: "Fishes & Aquarium" },
      { slug: "pet-food-accessories", name: "Pet Food & Accessories" },
      { slug: "dogs", name: "Dogs" },
      { slug: "cats", name: "Cats" },
      { slug: "birds", name: "Birds" },
      { slug: "other-pets", name: "Other Pets" },
    ],
  },
  {
    slug: "services",
    name: "Services",
    icon: "Wrench",
    tagline: "Trades, tuition, repairs and events",
    description:
      "Local service providers with rate cards, service radius and response times listed up front.",
    priceBand: [350, 500000],
    attributes: [
      {
        key: "rateType",
        label: "Charged",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Per hour", "Per visit", "Per day", "Per project", "Monthly"],
      },
      {
        key: "serviceRadius",
        label: "Service radius",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 1,
        max: 50,
        unit: "km",
      },
      { key: "atHome", label: "Available at home", type: ATTRIBUTE_TYPES.TOGGLE },
    ],
    subcategories: [
      { slug: "education-classes", name: "Education & Classes" },
      { slug: "tours-travel", name: "Tours & Travel" },
      { slug: "electronics-repair", name: "Electronics Repair & Services" },
      { slug: "health-beauty", name: "Health & Beauty" },
      { slug: "home-renovation", name: "Home Renovation & Repair" },
      { slug: "cleaning-pest-control", name: "Cleaning & Pest Control" },
      { slug: "legal-documentation", name: "Legal & Documentation" },
      { slug: "packers-movers", name: "Packers & Movers" },
      { slug: "event-services", name: "Event Services" },
      { slug: "driver-chauffeur", name: "Driver & Chauffeur" },
      { slug: "other-services", name: "Other Services" },
    ],
  },

  /* ---------------------------------------------------------------
   * AltF Bazaar originals — categories beyond the standard classifieds
   * set. These are what differentiate Bazaar from a plain OLX clone.
   * ------------------------------------------------------------- */

  {
    slug: "kids-baby",
    name: "Kids & Baby",
    icon: "Baby",
    tagline: "Prams, cots, toys and school gear",
    description:
      "Baby and child essentials that get outgrown fast — bought once, useful to three more families.",
    priceBand: [300, 80000],
    attributes: [
      CONDITION_SELECT,
      {
        key: "ageGroup",
        label: "Age group",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["0-6 months", "6-18 months", "1-3 years", "3-6 years", "6-10 years", "10+ years"],
      },
      { key: "sanitised", label: "Professionally sanitised", type: ATTRIBUTE_TYPES.TOGGLE },
    ],
    subcategories: [
      { slug: "prams-strollers", name: "Prams & Strollers" },
      { slug: "cots-cribs", name: "Cots & Cribs" },
      { slug: "toys-games", name: "Toys & Games" },
      { slug: "kids-clothing", name: "Kids' Clothing" },
      { slug: "school-supplies", name: "School Supplies" },
      { slug: "car-seats-carriers", name: "Car Seats & Carriers" },
      { slug: "feeding-nursery", name: "Feeding & Nursery" },
    ],
  },
  {
    slug: "gaming",
    name: "Gaming & Consoles",
    icon: "Gamepad2",
    tagline: "Consoles, rigs, GPUs and titles",
    description:
      "Consoles, gaming PCs, graphics cards and physical titles — with usage hours and thermal history where it matters.",
    priceBand: [300, 500000],
    attributes: [
      CONDITION_SELECT,
      {
        key: "platform",
        label: "Platform",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["PlayStation", "Xbox", "Nintendo", "PC", "Handheld", "Retro"],
      },
      WARRANTY_TOGGLE,
      { key: "boxed", label: "Original box & cables", type: ATTRIBUTE_TYPES.TOGGLE },
    ],
    subcategories: [
      { slug: "consoles", name: "Consoles" },
      { slug: "gaming-pcs", name: "Gaming PCs & Rigs" },
      { slug: "graphics-cards", name: "Graphics Cards" },
      { slug: "games-titles", name: "Games & Titles" },
      { slug: "controllers-accessories", name: "Controllers & Accessories" },
      { slug: "vr-headsets", name: "VR Headsets" },
      { slug: "streaming-gear", name: "Streaming Gear" },
    ],
  },
  {
    slug: "health-wellness",
    name: "Health & Wellness",
    icon: "HeartPulse",
    tagline: "Fitness gear, mobility aids and equipment",
    description:
      "Home gym equipment, mobility aids and wellness devices. Medical devices carry an expiry and certification field.",
    priceBand: [400, 300000],
    attributes: [
      CONDITION_SELECT,
      WARRANTY_TOGGLE,
      {
        key: "usageHours",
        label: "Approx. usage",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 0,
        max: 2000,
        unit: "hrs",
      },
    ],
    subcategories: [
      { slug: "home-gym", name: "Home Gym Equipment" },
      { slug: "treadmills-cardio", name: "Treadmills & Cardio" },
      { slug: "mobility-aids", name: "Mobility Aids" },
      { slug: "medical-devices", name: "Medical Devices" },
      { slug: "yoga-recovery", name: "Yoga & Recovery" },
      { slug: "supplements-nutrition", name: "Supplements & Nutrition" },
    ],
  },
  {
    slug: "industrial-business",
    name: "Industrial & Business",
    icon: "Factory",
    tagline: "Machinery, kitchen setups and shop fittings",
    description:
      "Restaurant kitchens, workshop machinery, retail fittings and full business takeovers — priced for operators, not browsers.",
    priceBand: [2000, 12000000],
    attributes: [
      CONDITION_SELECT,
      {
        key: "ageYears",
        label: "Age",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 0,
        max: 25,
        unit: "yrs",
      },
      {
        key: "powerPhase",
        label: "Power",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Single phase", "Three phase", "Manual", "Diesel"],
      },
      { key: "installation", label: "Installation included", type: ATTRIBUTE_TYPES.TOGGLE },
    ],
    subcategories: [
      { slug: "restaurant-kitchen", name: "Restaurant & Kitchen Equipment" },
      { slug: "workshop-machinery", name: "Workshop Machinery" },
      { slug: "retail-shop-fittings", name: "Retail & Shop Fittings" },
      { slug: "printing-packaging", name: "Printing & Packaging" },
      { slug: "generators-power", name: "Generators & Power" },
      { slug: "business-for-sale", name: "Running Business for Sale" },
      { slug: "medical-lab-equipment", name: "Medical & Lab Equipment" },
    ],
  },
  {
    slug: "agriculture-farming",
    name: "Agriculture & Farming",
    icon: "Sprout",
    tagline: "Implements, seeds, livestock and land gear",
    description:
      "Farm implements, irrigation kits, dairy equipment and livestock — listed with acreage suitability.",
    priceBand: [300, 3000000],
    attributes: [
      CONDITION_SELECT,
      {
        key: "suitableAcreage",
        label: "Suitable for",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 1,
        max: 200,
        unit: "acres",
      },
      { key: "organicCertified", label: "Organic certified", type: ATTRIBUTE_TYPES.TOGGLE },
    ],
    subcategories: [
      { slug: "farm-implements", name: "Farm Implements" },
      { slug: "irrigation-pumps", name: "Irrigation & Pumps" },
      { slug: "seeds-saplings", name: "Seeds & Saplings" },
      { slug: "livestock-dairy", name: "Livestock & Dairy" },
      { slug: "harvest-storage", name: "Harvest & Storage" },
      { slug: "poultry", name: "Poultry" },
    ],
  },
  {
    slug: "art-collectibles",
    name: "Art & Collectibles",
    icon: "Palette",
    tagline: "Originals, prints, coins and memorabilia",
    description:
      "Original art, handicraft, rare coins, stamps and memorabilia — with provenance notes where the seller has them.",
    priceBand: [200, 5000000],
    attributes: [
      CONDITION_SELECT,
      {
        key: "medium",
        label: "Medium",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Oil", "Acrylic", "Watercolour", "Digital print", "Sculpture", "Textile", "Mixed media"],
      },
      { key: "authenticated", label: "Provenance available", type: ATTRIBUTE_TYPES.TOGGLE },
      { key: "handmade", label: "Handmade", type: ATTRIBUTE_TYPES.TOGGLE },
    ],
    subcategories: [
      { slug: "paintings-originals", name: "Paintings & Originals" },
      { slug: "prints-posters", name: "Prints & Posters" },
      { slug: "sculptures-handicraft", name: "Sculptures & Handicraft" },
      { slug: "coins-currency", name: "Coins & Currency" },
      { slug: "stamps-philately", name: "Stamps & Philately" },
      { slug: "memorabilia", name: "Memorabilia" },
      { slug: "antiques", name: "Antiques" },
    ],
  },
  {
    slug: "tools-hardware",
    name: "Tools & Hardware",
    icon: "Hammer",
    tagline: "Power tools, ladders and building material",
    description:
      "Power tools, hand tools and leftover building material — the category every renovation ends with.",
    priceBand: [250, 200000],
    attributes: [
      CONDITION_SELECT,
      WARRANTY_TOGGLE,
      {
        key: "powerSource",
        label: "Power source",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Corded electric", "Cordless battery", "Manual", "Petrol", "Pneumatic"],
      },
    ],
    subcategories: [
      { slug: "power-tools", name: "Power Tools" },
      { slug: "hand-tools", name: "Hand Tools" },
      { slug: "ladders-scaffolding", name: "Ladders & Scaffolding" },
      { slug: "building-material", name: "Building Material" },
      { slug: "plumbing-electrical", name: "Plumbing & Electrical" },
      { slug: "safety-gear", name: "Safety Gear" },
    ],
  },
  {
    slug: "events-tickets",
    name: "Events & Tickets",
    icon: "Ticket",
    tagline: "Event gear, decor and transferable passes",
    description:
      "Wedding decor, sound systems, marquee hire and transferable event passes. Ticket listings are verified against the organiser's transfer policy.",
    priceBand: [200, 800000],
    attributes: [
      {
        key: "eventType",
        label: "Event type",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Wedding", "Concert", "Conference", "Sports", "Festival", "Private party"],
      },
      { key: "transferable", label: "Officially transferable", type: ATTRIBUTE_TYPES.TOGGLE },
      {
        key: "rateType",
        label: "Charged",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Per day", "Per event", "Fixed price"],
      },
    ],
    subcategories: [
      { slug: "wedding-decor", name: "Wedding Decor" },
      { slug: "sound-lighting", name: "Sound & Lighting" },
      { slug: "tents-marquees", name: "Tents & Marquees" },
      { slug: "event-tickets", name: "Event Tickets" },
      { slug: "catering-equipment", name: "Catering Equipment" },
      { slug: "costumes-props", name: "Costumes & Props" },
    ],
  },
  {
    slug: "rentals",
    name: "Rent Anything",
    icon: "CalendarClock",
    tagline: "Short-term hire instead of buying",
    description:
      "Cameras, party gear, tools and appliances available by the day or week. Buying is not always the answer.",
    priceBand: [250, 100000],
    attributes: [
      {
        key: "rentalPeriod",
        label: "Minimum period",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Per hour", "Per day", "Per week", "Per month"],
      },
      {
        key: "deposit",
        label: "Security deposit",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 0,
        max: 100000,
        // The market's currency symbol — the attribute formatters recognise
        // this unit and let it lead the number instead of trailing it.
        unit: getMarket().currencySymbol,
      },
      { key: "doorstep", label: "Doorstep delivery", type: ATTRIBUTE_TYPES.TOGGLE },
    ],
    subcategories: [
      { slug: "cameras-drones", name: "Cameras & Drones" },
      { slug: "party-event-gear", name: "Party & Event Gear" },
      { slug: "tools-machinery-rental", name: "Tools & Machinery" },
      { slug: "appliances-rental", name: "Appliances" },
      { slug: "furniture-rental", name: "Furniture" },
      { slug: "vehicles-rental", name: "Vehicles" },
    ],
  },
  {
    slug: "free-giveaway",
    name: "Free & Giveaway",
    icon: "Gift",
    tagline: "Zero rupees, collected in person",
    description:
      "Things people would rather give away than throw away. Everything here is ₹0 — first to collect, keeps.",
    priceBand: [0, 0],
    attributes: [
      CONDITION_SELECT,
      { key: "collectOnly", label: "Collection only", type: ATTRIBUTE_TYPES.TOGGLE },
      {
        key: "availableFor",
        label: "Available for",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Next 24 hours", "This week", "This month", "Until collected"],
      },
    ],
    subcategories: [
      { slug: "furniture-giveaway", name: "Furniture" },
      { slug: "appliances-giveaway", name: "Appliances" },
      { slug: "books-giveaway", name: "Books & Study Material" },
      { slug: "building-scrap", name: "Building Material & Scrap" },
      { slug: "plants-cuttings", name: "Plants & Cuttings" },
      { slug: "misc-giveaway", name: "Everything Else" },
    ],
  },
  {
    slug: "refurbished",
    name: "Refurbished Store",
    icon: "BadgeCheck",
    tagline: "Seller-graded, warranty-backed stock",
    description:
      "Professionally refurbished electronics and appliances from verified sellers, each with a stated grade and a return window.",
    priceBand: [1000, 400000],
    attributes: [
      {
        key: "grade",
        label: "Refurb grade",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["Grade A — as new", "Grade B — light marks", "Grade C — visible wear"],
      },
      {
        key: "warrantyMonths",
        label: "Warranty",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 0,
        max: 24,
        unit: "months",
      },
      { key: "returnWindow", label: "7-day return", type: ATTRIBUTE_TYPES.TOGGLE },
    ],
    subcategories: [
      { slug: "refurbished-phones", name: "Refurbished Phones" },
      { slug: "refurbished-laptops", name: "Refurbished Laptops" },
      { slug: "refurbished-appliances", name: "Refurbished Appliances" },
      { slug: "refurbished-audio", name: "Refurbished Audio" },
      { slug: "open-box", name: "Open Box Deals" },
    ],
  },
  {
    slug: "travel-outdoor",
    name: "Travel & Outdoor",
    icon: "Tent",
    tagline: "Camping, trekking and travel kit",
    description:
      "Tents, trekking packs, camping stoves and travel luggage — gear that spends most of the year in a cupboard.",
    priceBand: [400, 250000],
    attributes: [
      CONDITION_SELECT,
      {
        key: "capacity",
        label: "Capacity",
        type: ATTRIBUTE_TYPES.SELECT,
        options: ["1 person", "2 person", "3-4 person", "5+ person", "Not applicable"],
      },
      {
        key: "usageCount",
        label: "Times used",
        type: ATTRIBUTE_TYPES.RANGE,
        min: 0,
        max: 100,
        unit: "trips",
      },
    ],
    subcategories: [
      { slug: "tents-camping", name: "Tents & Camping" },
      { slug: "trekking-backpacks", name: "Trekking & Backpacks" },
      { slug: "travel-luggage", name: "Travel Luggage" },
      { slug: "outdoor-cooking", name: "Outdoor Cooking" },
      { slug: "water-sports", name: "Water Sports" },
      { slug: "climbing-gear", name: "Climbing Gear" },
    ],
  },
];

/* ------------------------------------------------------------------
 * Lookups. All synchronous and allocation-light — `sitemap.js` and
 * `generateStaticParams` call these during the build.
 * ---------------------------------------------------------------- */

const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

/** @returns {object|null} */
export function getCategory(slug) {
  return CATEGORY_BY_SLUG.get(String(slug || "").toLowerCase()) || null;
}

export function getAllCategories() {
  return CATEGORIES;
}

export function getCategorySlugs() {
  return CATEGORIES.map((c) => c.slug);
}

/** @returns {object|null} the subcategory record within `categorySlug`. */
export function getSubcategory(categorySlug, subSlug) {
  const category = getCategory(categorySlug);
  if (!category) return null;
  const wanted = String(subSlug || "").toLowerCase();
  return category.subcategories.find((s) => s.slug === wanted) || null;
}

/** Every `{ category, sub }` pair — feeds `generateStaticParams`. */
export function getAllCategoryPairs() {
  const pairs = [];
  for (const category of CATEGORIES) {
    for (const sub of category.subcategories) {
      pairs.push({ category: category.slug, sub: sub.slug });
    }
  }
  return pairs;
}

/** Flat list of every subcategory with a back-reference to its parent. */
export function getAllSubcategories() {
  return CATEGORIES.flatMap((category) =>
    category.subcategories.map((sub) => ({
      ...sub,
      categorySlug: category.slug,
      categoryName: category.name,
    })),
  );
}

/** Attribute definition lookup, used by the filter rail and post wizard. */
export function getCategoryAttribute(categorySlug, key) {
  const category = getCategory(categorySlug);
  if (!category) return null;
  return category.attributes.find((a) => a.key === key) || null;
}

export const CATEGORY_COUNT = CATEGORIES.length;
export const SUBCATEGORY_COUNT = CATEGORIES.reduce(
  (total, category) => total + category.subcategories.length,
  0,
);
