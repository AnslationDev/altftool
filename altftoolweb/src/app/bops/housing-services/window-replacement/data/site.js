// Centralised content for the Lumina Windows site.

export const img = (id, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const company = {
  name: "Lumina",
  full: "Lumina Windows & Facades",
  tagline: "Windows that frame your world",
  phone: "+91 98765 43210",
  phoneHref: "+919876543210",
  email: "hello@luminawindows.in",
  address: "14 Heritage Chambers, Linking Road, Bandra West, Mumbai 400050",
  hours: "Mon – Sat · 9:30 AM – 7:00 PM",
  area: "Serving Mumbai, Pune & Surrounding Regions",
};

export const navLinks = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/#services" },
  { label: "About", to: "/#about" },
  { label: "Blog", to: "/#blog" },
  { label: "Contact", to: "/#contact" },
];

export const stats = [
  { value: "25+", label: "Years of Expertise" },
  { value: "12K+", label: "Windows Installed" },
  { value: "480+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
];

export const services = [
  {
    icon: "sparkles",
    title: "Window Design & Manufacturing",
    image: 8082306,
    excerpt:
      "Made-to-measure windows crafted around your architecture, light and lifestyle.",
    description:
      "Every window begins with a conversation. Our design studio translates your vision — and your home's character — into precision-engineered windows manufactured in-house for a flawless fit.",
    points: [
      "Bespoke sizing for any opening",
      "Premium finishes & hardware",
      "3D visualisation before build",
      "Architect & interior collaboration",
    ],
  },
  {
    icon: "window",
    title: "Aluminium & uPVC Windows",
    image: 6908367,
    excerpt:
      "Slim, strong and weather-tight frames built to perform for decades.",
    description:
      "Thermally-broken aluminium and multi-chambered uPVC systems that pair sleek sightlines with outstanding insulation, security and sound performance.",
    points: [
      "Thermally broken profiles",
      "Marine-grade corrosion resistance",
      "Multi-point locking",
      "Low-maintenance finishes",
    ],
  },
  {
    icon: "sliders",
    title: "Sliding & Folding Systems",
    image: 6444249,
    excerpt:
      "Effortless large-opening systems that dissolve the line between in and out.",
    description:
      "From slimline sliding panels to folding-folding (bi-fold) doors, our track systems deliver smooth, silent movement and maximal glass for uninterrupted views.",
    points: [
      "Lift-and-slide & soft-close",
      "Slim 20mm interlock options",
      "Heavy-duty roller tracks",
      "Flush threshold detailing",
    ],
  },
  {
    icon: "building",
    title: "Facade & Structural Glazing",
    image: 9901861,
    excerpt:
      "Statement commercial facades and frameless glass for bold architecture.",
    description:
      "Unitised curtain walls, spider glazing and structural silicone systems engineered for performance, safety and striking aesthetics at any scale.",
    points: [
      "Curtain wall & spider glazing",
      "Double-skin facades",
      "Wind & thermal load engineering",
      "Commercial project delivery",
    ],
  },
  {
    icon: "wrench",
    title: "Window Installation & Replacement",
    image: 8961695,
    excerpt:
      "Clean, certified installation — and seamless replacement of old windows.",
    description:
      "Our certified crews fit and replace windows with surgical precision, protecting your interiors and ensuring airtight, watertight, level results every time.",
    points: [
      "Dust-free replacement process",
      "Interior protection guaranteed",
      "Precision levelling & sealing",
      "Same-day completion options",
    ],
  },
  {
    icon: "shield",
    title: "Repair, Maintenance & Cleaning",
    image: 6166469,
    excerpt:
      "Keep your windows gliding, sealed and sparkling with expert aftercare.",
    description:
      "From resealing and hardware upgrades to high-rise cleaning, our aftercare team keeps your investment performing and looking its best for years to come.",
    points: [
      "Glass & seal replacement",
      "Hardware & track servicing",
      "High-rise rope-access cleaning",
      "Annual care contracts",
    ],
  },
];

export const windowDesigns = [
  { title: "Floor-to-Ceiling Glazing", tag: "Modern", image: 8082312, size: "tall" },
  { title: "Bay Window Nook", tag: "Classic", image: 10258622, size: "" },
  { title: "Aluminium Sliding", tag: "uPVC · Aluminium", image: 6444249, size: "" },
  { title: "Tall Picture Window", tag: "Sunlit", image: 33974423, size: "tall" },
  { title: "Black Steel Frames", tag: "Industrial", image: 30583624, size: "" },
  { title: "Cottage Casement", tag: "Cosy", image: 7061409, size: "" },
  { title: "Facade Glazing", tag: "Commercial", image: 19107852, size: "wide" },
  { title: "Corner Glass Living", tag: "Minimal", image: 8082306, size: "" },
];

export const features = [
  {
    icon: "leaf",
    title: "Energy Efficient",
    text: "Double & triple glazing with low-E coatings cut heat loss and lower your bills year-round.",
  },
  {
    icon: "sparkles",
    title: "Premium Materials",
    text: "Grade-A aluminium, virgin uPVC and certified safety glass sourced from trusted global mills.",
  },
  {
    icon: "ruler",
    title: "Expert Craftsmanship",
    text: "Master installers with an average of 12 years' experience on residential and commercial sites.",
  },
  {
    icon: "shield",
    title: "Smart Warranty",
    text: "Up to 10 years of cover on frames, glass and hardware — backed by our service promise.",
  },
  {
    icon: "window",
    title: "Custom Design",
    text: "Made-to-measure for any shape, size or style — from heritage homes to modern towers.",
  },
  {
    icon: "clock",
    title: "On-Time Delivery",
    text: "Transparent timelines and punctual crews that respect your schedule and your space.",
  },
];

export const steps = [
  {
    icon: "search",
    title: "Consultation",
    text: "We visit your space, understand your goals and take precise measurements — free of charge.",
  },
  {
    icon: "pencil",
    title: "Design",
    text: "Our studio crafts a tailored design with 3D visuals, finishes and a transparent quote.",
  },
  {
    icon: "layers",
    title: "Manufacture",
    text: "Windows are engineered and fabricated in-house to exacting quality standards.",
  },
  {
    icon: "wrench",
    title: "Installation",
    text: "Certified crews install with care, seal to perfection and leave your home spotless.",
  },
];

export const testimonials = [
  {
    name: "Anita Sharma",
    role: "Homeowner · Bandra",
    initials: "AS",
    rating: 5,
    quote:
      "Lumina transformed our living room with floor-to-ceiling glazing. The light, the views, the finish — flawless. The crew was tidy, punctual and genuinely lovely to work with.",
  },
  {
    name: "Rohan Mehta",
    role: "Architect · Studio Meridian",
    initials: "RM",
    rating: 5,
    quote:
      "As an architect I'm picky about details. Lumina's slimline aluminium systems and fabrication tolerance are easily the best I've specified in Mumbai. They're now my default.",
  },
  {
    name: "Priya Nair",
    role: "Homeowner · Pune",
    initials: "PN",
    rating: 5,
    quote:
      "We replaced drafty old windows with acoustic uPVC and the difference in sound and temperature is incredible. Honest pricing, no surprises, and a 10-year warranty.",
  },
  {
    name: "Vikram Singh",
    role: "Facilities Lead · Orbit Spaces",
    initials: "VS",
    rating: 5,
    quote:
      "They handled our entire commercial facade — on time, on budget, and to spec. Documentation, safety and aftercare were all first-rate. Highly recommended for commercial work.",
  },
];

export const team = [
  { name: "Arjun Malhotra", role: "Founder & Principal Designer", initials: "AM", imageId: 2182970 },
  { name: "Sneha Iyer", role: "Head of Design", initials: "SI", imageId: 1181686 },
  { name: "Rajat Verma", role: "Production Director", initials: "RV", imageId: 1222271 },
  { name: "Meera Kapoor", role: "Client Experience Lead", initials: "MK", imageId: 733872 },
];

export const values = [
  {
    icon: "target",
    title: "Precision First",
    text: "Millimetre-accurate fabrication and installation is the foundation of everything we do.",
  },
  {
    icon: "leaf",
    title: "Built to Last",
    text: "We choose materials and methods that perform for decades, not seasons.",
  },
  {
    icon: "heart",
    title: "People-Centric",
    text: "Transparent communication, fair pricing and respect for your home and time.",
  },
  {
    icon: "award",
    title: "Craft & Beauty",
    text: "We believe windows should be as beautiful as they are functional.",
  },
];

export const packages = [
  {
    name: "Essential",
    price: "₹1,499",
    unit: "/ sq.ft",
    blurb: "Reliable, great-looking windows for everyday spaces.",
    featured: false,
    features: [
      "Standard aluminium sliding",
      "Double-glazed units",
      "Multi-point locking",
      "5-year warranty",
      "Standard colour palette",
    ],
  },
  {
    name: "Signature",
    price: "₹2,299",
    unit: "/ sq.ft",
    blurb: "Our most popular blend of performance and style.",
    featured: true,
    features: [
      "Premium aluminium & uPVC",
      "Acoustic & low-E glazing",
      "Slimline sightlines",
      "Smart-lock ready hardware",
      "8-year warranty",
    ],
  },
  {
    name: "Bespoke",
    price: "Custom",
    unit: "quote",
    blurb: "Fully custom facades and designer systems.",
    featured: false,
    features: [
      "Custom facade & structural glazing",
      "Designer finishes & ironmongery",
      "Motorised / smart integration",
      "Dedicated project manager",
      "10-year warranty",
    ],
  },
];

export const blogCategories = ["All", "Design Trends", "Guides", "Inspiration", "Industry"];

export const blogPosts = [
  {
    title: "Window Design Trends Shaping Modern Homes in 2026",
    category: "Design Trends",
    date: "Feb 12, 2026",
    readTime: "6 min read",
    author: "Sneha Iyer",
    image: 31234051,
    featured: true,
    excerpt:
      "From frameless corner glazing to smart-tinted glass, here are the window trends defining how India will live, light and look out in the year ahead.",
  },
  {
    title: "Aluminium vs uPVC Windows: Which Should You Choose?",
    category: "Guides",
    date: "Jan 28, 2026",
    readTime: "5 min read",
    author: "Rajat Verma",
    image: 6444249,
    excerpt:
      "Both are excellent — but they shine in different ways. We break down cost, durability, insulation and aesthetics to help you decide.",
  },
  {
    title: "Maximising Natural Light with Floor-to-Ceiling Glazing",
    category: "Inspiration",
    date: "Jan 14, 2026",
    readTime: "4 min read",
    author: "Arjun Malhotra",
    image: 6580239,
    excerpt:
      "Big glass done right can change how a home feels. Here's how to flood your interiors with light without sacrificing comfort.",
  },
  {
    title: "How to Soundproof Your Home with the Right Glazing",
    category: "Guides",
    date: "Dec 30, 2025",
    readTime: "7 min read",
    author: "Sneha Iyer",
    image: 8082306,
    excerpt:
      "City noise is the new pollution. Discover how laminated and acoustic glazing can turn a noisy street into a quiet sanctuary.",
  },
  {
    title: "Bay Windows: 10 Styling Ideas for Cosy Corners",
    category: "Inspiration",
    date: "Dec 16, 2025",
    readTime: "5 min read",
    author: "Meera Kapoor",
    image: 10258622,
    excerpt:
      "A bay window is an opportunity, not just an opening. Ten beautiful ways to turn that alcove into your favourite spot.",
  },
  {
    title: "Understanding Energy-Efficient Glass Ratings",
    category: "Industry",
    date: "Dec 02, 2025",
    readTime: "8 min read",
    author: "Rajat Verma",
    image: 9901861,
    excerpt:
      "U-values, SHGC, low-E coatings — glass ratings can feel like alphabet soup. We translate the jargon into plain English.",
  },
  {
    title: "Maintenance Tips to Keep Your Windows Like New",
    category: "Guides",
    date: "Nov 20, 2025",
    readTime: "4 min read",
    author: "Meera Kapoor",
    image: 6166469,
    excerpt:
      "A little seasonal care keeps windows gliding smoothly and looking pristine. Here's our simple year-round maintenance checklist.",
  },
  {
    title: "The Rise of Black Steel-Framed Windows in Interiors",
    category: "Design Trends",
    date: "Nov 06, 2025",
    readTime: "6 min read",
    author: "Arjun Malhotra",
    image: 30583624,
    excerpt:
      "Slim black steel frames have become the defining detail of contemporary interiors. Why they work — and how to use them well.",
  },
  {
    title: "5 Window Cleaning Hacks for Monsoon Season",
    category: "Guides",
    date: "Oct 18, 2025",
    readTime: "4 min read",
    author: "Sneha Iyer",
    image: 10258622,
    excerpt:
      "Keep your glass gleaming even through heavy rains. We share professional tips and simple household ingredients that cut through grime and water spots.",
  },
  {
    title: "The Return of Timber: Why Wood Frames Are Making a Comeback",
    category: "Design Trends",
    date: "Oct 05, 2025",
    readTime: "7 min read",
    author: "Arjun Malhotra",
    image: 9901861,
    excerpt:
      "Modern engineered timber brings the warmth of wood without the warping. Discover how architects are blending classic materials with cutting-edge thermal performance.",
  },
  {
    title: "Smart Windows: Integrating Glass with Home Automation",
    category: "Industry",
    date: "Sep 22, 2025",
    readTime: "5 min read",
    author: "Rajat Verma",
    image: 31234051,
    excerpt:
      "From auto-tinting electrochromic glass to motorized vents synced with your thermostat, see what the next generation of smart fenestration looks like.",
  },
];

export const faqs = [
  {
    q: "How long does a typical installation take?",
    a: "Most residential installations are completed in 1–2 days per home, depending on the number and type of windows. During your free consultation we provide a clear, day-by-day timeline so there are no surprises.",
  },
  {
    q: "Do you offer a warranty?",
    a: "Yes. Every project is backed by warranty cover ranging from 5 to 10 years on frames, glass and hardware, depending on the system you choose. Our aftercare team is always on hand should you need us.",
  },
  {
    q: "Which window material is best for my climate?",
    a: "For coastal and high-humidity areas we recommend marine-grade thermally-broken aluminium; for noise and insulation priorities, multi-chambered uPVC with acoustic glazing shines. We'll recommend the ideal system after assessing your site.",
  },
  {
    q: "Can you replace windows without damaging my interiors?",
    a: "Absolutely. Our dust-free replacement process includes protective sheeting for floors and furnishings, careful removal of old frames, precision fitting and a full clean-up before we leave.",
  },
  {
    q: "Do you handle commercial and facade projects?",
    a: "Yes. We design, engineer and install curtain walls, structural glazing and unitised facades for offices, retail and hospitality. We're equipped to deliver large-scale commercial work to spec and on schedule.",
  },
  {
    q: "What areas do you serve?",
    a: "We currently serve Mumbai, Pune and the surrounding regions, with selected projects pan-India. Get in touch and we'll confirm coverage for your location.",
  },
];
