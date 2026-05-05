export const extensionMap = {
    // --- Utilities & Calculators ---
    "bmi-calculator": {
        name: "BMI Calculator",
        description: "Calculates Body Mass Index using height and weight with instant health categorization.",
        icon: "Calculator",
        category: "Utilities & Calculators",
        image: "/extension/bmi-calculator.png",
        chromeUrl: "https://chromewebstore.google.com/detail/bmi-calculator/ejlfenjobcmccecilhkadjekbpoooila",
        features: ["Calculate BMI", "Health categorization", "Imperial & Metric support"],
        rating: 4.8
    },
    "calculate-age": {
        name: "Calculate Age",
        description: "Computes exact age in years, months, and days from date of birth.",
        icon: "Calendar",
        category: "Utilities & Calculators",
        image: "/extension/calculate-age.png",
        chromeUrl: "https://chromewebstore.google.com/detail/age-calculator/fnfpjhamofbfegjmadhpljoclihcgcmf",
        features: ["Precise age calculation", "Next birthday countdown", "Shareable results"],
        rating: 4.7
    },

    "roi-calculator": {
        name: "ROI Calculator",
        description: "Calculates return on investment based on cost and profit inputs.",
        icon: "TrendingUp",
        category: "Utilities & Calculators",
        image: "/extension/roi-calculator.png",
        chromeUrl: "https://chromewebstore.google.com/detail/feature-roi-pro/pcemcicijomnlbnkpgjghdophbnlkafc",
        features: ["Simple inputs", "Percentage calculation", "Visual graph"],
        rating: 4.7
    },
    "loan-emi-calculator": {
        name: "Loan EMI Calculator",
        description: "Computes monthly EMI based on loan amount, interest rate, and tenure.",
        icon: "DollarSign",
        category: "Utilities & Calculators",
        image: "/extension/loan-emi-calculator.png",
        chromeUrl: "#",
        features: ["Monthly breakdown", "Total interest validation", "Amortization table"],
        rating: 4.8
    },
    "fuel-cost-estimator": {
        name: "Fuel Cost Estimator",
        description: "Estimates trip fuel cost using distance and mileage inputs.",
        icon: "Fuel",
        category: "Utilities & Calculators",
        image: "/extension/fuel-cost-estimator.png",
        chromeUrl: "#",
        features: ["Trip cost estimation", "Gas vs Diesel comparison", "Mileage adjustment"],
        rating: 4.4
    },
    "convertall": {
        name: "ConvertAll",
        description: "All-in-one unit converter for length, weight, temperature, speed, and more.",
        icon: "ArrowRightLeft",
        category: "Utilities & Calculators",
        image: "/extension/convert-all.png",
        chromeUrl: "https://chromewebstore.google.com/detail/convertall/icochckfanmepkplkdlhcfhpkhhfpmem",
        features: ["Length", "Weight", "Temperature", "Speed", "Fahrenheit ↔ Celsius"],
        rating: 4.7
    },
    "water-alert": {
        name: "Water Alert",
        description: "Sends periodic reminders to drink water at set intervals.",
        icon: "Droplets",
        category: "Utilities & Calculators",
        image: "/extension/water-alert.png",
        chromeUrl: "#",
        features: ["Custom intervals", "Sound notifications", "Daily tracking"],
        rating: 4.9
    },
    "budget-planner": {
        name: "Budget Planner",
        description: "Helps users track income, expenses, and monthly savings.",
        icon: "PieChart",
        category: "Utilities & Calculators",
        image: "/extension/budget-planner.png",
        chromeUrl: "#",
        features: ["Expense categorization", "Savings goals", "Monthly summary"],
        rating: 4.8
    },

    // --- File, Data & Formatter Tools ---
    "dataformat-pro": {
        name: "DataFormat Pro",
        description: "All-in-one JSON formatter, validator, and JSON ↔ XML converter with file upload support.",
        icon: "FileJson",
        category: "File, Data & Formatter Tools",
        image: "/extension/json-formatter.png",
        chromeUrl: "https://chromewebstore.google.com/detail/dataformat-pro/efmdoeblpnfppbppmgngbadddpkomidp",
        features: ["JSON beautifier", "JSON ↔ XML conversion", "Syntax validation", "File upload", "Collapsible trees"],
        rating: 4.9
    },
    "csv-json-converter": {
        name: "CSV to JSON Converter",
        description: "Converts CSV data into structured JSON format.",
        icon: "FileSpreadsheet",
        category: "File, Data & Formatter Tools",
        image: "/extension/csv-json-converter.png",
        chromeUrl: "https://chromewebstore.google.com/detail/csv-%E2%87%84-json-converter/hlnlahkmfhmlikmgfeimfbmdgompdobo",
        features: ["Preview data", "Custom delimiters", "Export options"],
        rating: 4.8
    },
    "latex-pdf-editor": {
        name: "LaTeX to PDF Editor",
        description: "Converts LaTeX documents into downloadable PDFs.",
        icon: "BookOpen",
        category: "File, Data & Formatter Tools",
        image: "/extension/latex-pdf-editor.png",
        chromeUrl: "https://chromewebstore.google.com/detail/latex-to-pdf-generator/pkfchhkfagkhajbkiphankanoccjmnld",
        features: ["Live preview", "Syntax error highlighting", "High-quality PDF export"],
        rating: 4.9
    },
    "image-to-pdf": {
        name: "Image to PDF Converter",
        description: "Converts multiple images into a single PDF file.",
        icon: "FileImage",
        category: "File, Data & Formatter Tools",
        image: "/extension/image-to-pdf.png",
        chromeUrl: "#",
        features: ["Drag & drop", "Reorder images", "Compression options"],
        rating: 4.8
    },
    "pdf-previewer": {
        name: "PDF Previewer",
        description: "Previews PDF files directly inside the browser.",
        icon: "Eye",
        category: "File, Data & Formatter Tools",
        image: "/extension/pdf-previewer.png",
        chromeUrl: "#",
        features: ["Zoom controls", "Page navigation", "Search enabled"],
        rating: 4.5
    },
    "markdown-previewer": {
        name: "Markdown Previewer",
        description: "Renders live Markdown into formatted HTML output.",
        icon: "FileText",
        category: "File, Data & Formatter Tools",
        image: "/extension/markdown-previewer.png",
        chromeUrl: "#",
        features: ["Live rendering", "Syntax support", "Export to HTML"],
        rating: 4.8
    },
    "html-previewer": {
        name: "HTML Previewer",
        description: "Displays real-time HTML output for pasted code.",
        icon: "Code",
        category: "File, Data & Formatter Tools",
        image: "/extension/html-previewer.png",
        chromeUrl: "#",
        features: ["Instant preview", "Error detection", "Responsive test"],
        rating: 4.6
    },

    // --- Design & CSS Tools ---
    "css-background-generator": {
        name: "CSS Background Generator",
        description: "Creates gradient and pattern CSS backgrounds.",
        icon: "Palette",
        category: "Design & CSS Tools",
        image: "/extension/css-background-generator.png",
        chromeUrl: "#",
        features: ["Gradient maker", "Pattern library", "One-click copy code"],
        rating: 4.7
    },
    "color-picker": {
        name: "Color Picker",
        description: "Picks and copies color codes from any webpage.",
        icon: "Pipette",
        category: "Design & CSS Tools",
        image: "/extension/color-picker.png",
        chromeUrl: "https://chromewebstore.google.com/detail/pixel-perfect-color-picke/kmpiebbhgoghpnngomnmcbmionnieimj",
        features: ["Eyedropper tool", "HEX/RGB/HSL formats", "History palette"],
        rating: 4.8
    },
    "css-specificity-calculator": {
        name: "CSS Specificity Calculator",
        description: "Calculates specificity score for CSS selectors.",
        icon: "Hash",
        category: "Design & CSS Tools",
        image: "/extension/css-specificity-calculator.png",
        chromeUrl: "#",
        features: ["Visual breakdown", "Compare selectors", "Tips for improvement"],
        rating: 4.5
    },
    "design-token-generator": {
        name: "Design Token Generator",
        description: "Generates reusable design tokens for UI systems.",
        icon: "Layers",
        category: "Design & CSS Tools",
        image: "/extension/design-token-generator.png",
        chromeUrl: "#",
        features: ["Color tokens", "Typography tokens", "Export to JSON/CSS"],
        rating: 4.6
    },
    "whatfont-extension": {
        name: "WhatFont Extension",
        description: "Detects font family, size, and weight on any webpage.",
        icon: "Type",
        category: "Design & CSS Tools",
        image: "/extension/whatfont-extension.png",
        chromeUrl: "#",
        features: ["Hover to identify", "Detailed specs", "One-click copy"],
        rating: 4.9
    },

    // --- Productivity & Focus ---
    "pomodoro-timer": {
        name: "Pomodoro Timer",
        description: "Focus timer using Pomodoro productivity technique.",
        icon: "Timer",
        category: "Productivity & Focus",
        image: "/extension/pomodoro-timer.png",
        chromeUrl: "#",
        features: ["Customizable intervals", "Task association", "Break notifications"],
        rating: 4.8
    },
    "focus-mode": {
        name: "Focus Mode",
        description: "Blocks distractions and enables deep work sessions.",
        icon: "Maximize",
        category: "Productivity & Focus",
        image: "/extension/focus-mode.png",
        chromeUrl: "#",
        features: ["Website blocker", "Schedule mode", "Insights"],
        rating: 4.9
    },
    "daily-goal-tracker": {
        name: "Daily Goal Tracker",
        description: "Tracks daily tasks and productivity goals.",
        icon: "CheckSquare",
        category: "Productivity & Focus",
        image: "/extension/daily-goal-tracker.png",
        chromeUrl: "#",
        features: ["To-do list", "Progress bars", "Completion history"],
        rating: 4.7
    },
    "time-spent-tracker": {
        name: "Time Spent Tracker",
        description: "Tracks time spent on different websites.",
        icon: "History",
        category: "Productivity & Focus",
        image: "/extension/time-spent-tracker.png",
        chromeUrl: "#",
        features: ["Domain tracking", "Daily summaries", "Usage limits"],
        rating: 4.6
    },
    "quick-search": {
        name: "Quick Search",
        description: "Enables instant search across predefined sites.",
        icon: "Search",
        category: "Productivity & Focus",
        image: "/extension/quick-search.png",
        chromeUrl: "#",
        features: ["Custom shortcuts", "Multi-engine support", "Fast results"],
        rating: 4.5
    },

    // --- Text, Writing & Content ---
    "grammar-check-pro": {
        name: "Grammar Check Pro",
        description: "Detects grammar and spelling issues in text.",
        icon: "SpellCheck",
        category: "Text, Writing & Content",
        image: "/extension/grammar-check-pro.png",
        chromeUrl: "#",
        features: ["Real-time checking", "Correction suggestions", "Multi-language"],
        rating: 4.7
    },
    "text-summarizer": {
        name: "Text Summarizer",
        description: "Summarizes long text into concise output.",
        icon: "FileText",
        category: "Text, Writing & Content",
        image: "/extension/text-summarizer.png",
        chromeUrl: "#",
        features: ["Adjustable length", "Bullet point mode", "Copy summary"],
        rating: 4.6
    },
    "text-to-voice": {
        name: "Text to Voice",
        description: "Converts written text into speech audio.",
        icon: "Mic", // Or Speaker
        category: "Text, Writing & Content",
        image: "/extension/text-to-voice.png",
        chromeUrl: "#",
        features: ["Multiple voices", "Speed control", "Download audio"],
        rating: 4.5
    },
    "prompt-optimizer": {
        name: "Prompt Optimizer",
        description: "Improves AI prompts for clarity and effectiveness.",
        icon: "Sparkles",
        category: "Text, Writing & Content",
        image: "/extension/prompt-optimizer.png",
        chromeUrl: "#",
        features: ["AI suggestions", "Templates", "History"],
        rating: 4.8
    },
    "prompt-saver": {
        name: "Prompt Saver",
        description: "Saves and organizes AI prompts for reuse.",
        icon: "Bookmark",
        category: "Text, Writing & Content",
        image: "/extension/prompt-saver.png",
        chromeUrl: "#",
        features: ["Tagging system", "Searchable", "One-click copy"],
        rating: 4.7
    },
    "readme-generator": {
        name: "Readme Generator",
        description: "Auto-generates clean README files for projects.",
        icon: "FileCode",
        category: "Text, Writing & Content",
        image: "/extension/readme-generator.png",
        chromeUrl: "#",
        features: ["Template selection", "Markdown formatting", "Preview"],
        rating: 4.9
    },
    "resume-keyword-checker": {
        name: "Resume Keyword Checker",
        description: "Checks resume keywords against job descriptions.",
        icon: "Briefcase",
        category: "Text, Writing & Content",
        image: "/extension/resume-keyword-checker.png",
        chromeUrl: "#",
        features: ["Job match score", "Missing keywords", "Optimization tips"],
        rating: 4.8
    },
    "sentiment-analyzer": {
        name: "Sentiment Analyzer",
        description: "Detects emotional tone (positive/neutral/negative).",
        icon: "Smile",
        category: "Text, Writing & Content",
        image: "/extension/sentiment-analyzer.png",
        chromeUrl: "#",
        features: ["Tone detection", "Score breakdown", "Text highlighting"],
        rating: 4.5
    },
    "seo-generator": {
        name: "SEO Generator",
        description: "Generates SEO-optimized titles, descriptions, and tags.",
        icon: "Search",
        category: "Text, Writing & Content",
        image: "/extension/seo-generator.png",
        chromeUrl: "#",
        features: ["Meta tags", "Keyword analysis", "Preview on SERP"],
        rating: 4.7
    },
    "keyword-extractor": {
        name: "Keyword Extractor",
        description: "Extracts important keywords from text content.",
        icon: "Key",
        category: "Text, Writing & Content",
        image: "/extension/keyword-extractor.png",
        chromeUrl: "#",
        features: ["Frequency count", "Relevance scoring", "Export list"],
        rating: 4.6
    },

    // --- Analytics, Web & SEO ---
    "quick-web-scraper": {
        name: "Quick Web Scraper",
        description: "One-click web scraper to extract data from any webpage instantly.",
        icon: "Globe",
        category: "Analytics, Web & SEO",
        image: "/extension/quick-web-scraper.png",
        chromeUrl: "https://chromewebstore.google.com/detail/quick-web-scraper-one-cli/cbgfnanifjmhogpoampfpfpfekpcejpl",
        features: ["One-click scraping", "Table extraction", "Export to CSV/JSON", "Auto-detect data"],
        rating: 4.8
    },
    "gmail-analytics": {
        name: "Gmail Analytics",
        description: "Shows email usage stats and productivity insights.",
        icon: "Mail",
        category: "Analytics, Web & SEO",
        image: "/extension/gmail-analytics.png",
        chromeUrl: "https://chromewebstore.google.com/detail/gmail-analytics/jcbinlcgcbagmbkophocaggllabdhddn",
        features: ["Response time", "Traffic volume", "Best time to email"],
        rating: 4.7
    },
    "website-performance": {
        name: "Website Performance Estimator",
        description: "Estimates load time and performance score.",
        icon: "Zap",
        category: "Analytics, Web & SEO",
        image: "/extension/website-performance.png",
        chromeUrl: "#",
        features: ["Speed score", "Optimization tips", "Mobile vs Desktop"],
        rating: 4.8
    },
    "url-safety-preview": {
        name: "URL Safety Preview",
        description: "Checks URLs for security and previews destination.",
        icon: "ShieldCheck",
        category: "Analytics, Web & SEO",
        image: "/extension/url-safety-preview.png",
        chromeUrl: "#",
        features: ["Malware scan", "Screenshot preview", "Redirect tracer"],
        rating: 4.9
    },
    "tech-detector-pro": {
        name: "Tech Detector Pro",
        description: "Detects technologies used on websites.",
        icon: "Cpu",
        category: "Analytics, Web & SEO",
        image: "/extension/tech-detector-pro.png",
        chromeUrl: "https://chromewebstore.google.com/detail/tech-detector-pro/oaglmkaddmicfhpagbkcojamnkbgffok",
        features: ["Visualizes stack", "Version detection", "Library insights"],
        rating: 4.8
    },
    "accessibility-audit": {
        name: "Accessibility Audit Extension",
        description: "Audits websites for accessibility issues.",
        icon: "Accessibility",
        category: "Analytics, Web & SEO",
        image: "/extension/accessibility-audit.png",
        chromeUrl: "#",
        features: ["WCAG complaince", "Contrast check", "Report generation"],
        rating: 4.7
    },

    // --- Media & Image Tools ---
    "image-compressor": {
        name: "Image Compressor",
        description: "Compresses images without noticeable quality loss.",
        icon: "Minimize",
        category: "Media & Image Tools",
        image: "/extension/image-compressor.png",
        chromeUrl: "#",
        features: ["Batch compression", "Format retention", "Before/After"],
        rating: 4.8
    },
    "image-cropper": {
        name: "Image Cropper",
        description: "Crops images with fixed or free aspect ratios.",
        icon: "Crop",
        category: "Media & Image Tools",
        image: "/extension/image-cropper.png",
        chromeUrl: "#",
        features: ["Preset ratios", "Free transform", "Download cropped"],
        rating: 4.6
    },
    "image-resizer": {
        name: "Image Resizer",
        description: "Resizes images to custom dimensions.",
        icon: "Move",
        category: "Media & Image Tools",
        image: "/extension/image-resizer.png",
        chromeUrl: "#",
        features: ["Pixel/Percentage", "Maintain aspect ratio", "Batch resize"],
        rating: 4.7
    },
    "screen-recorder": {
        name: "Screen Recorder",
        description: "Records screen activity with audio.",
        icon: "Video",
        category: "Media & Image Tools",
        image: "/extension/screen-recorder.png",
        chromeUrl: "#",
        features: ["Full screen/Window", "Microphone audio", "Save to local"],
        rating: 4.9
    },

    // --- Forms, Data & Automation ---
    "auto-form-filler": {
        name: "Auto Form Filler",
        description: "Automatically fills forms using saved data.",
        icon: "PenTool",
        category: "Forms, Data & Automation",
        image: "/extension/auto-form-filler.png",
        chromeUrl: "#",
        features: ["Profile support", "Secure storage", "Custom matching"],
        rating: 4.7
    },
    "quickfill-pro": {
        name: "QuickFill Pro",
        description: "Advanced autofill for repetitive input tasks.",
        icon: "FastForward",
        category: "Forms, Data & Automation",
        image: "/extension/quickfill-pro.png",
        chromeUrl: "#",
        features: ["Regex support", "Hotkeys", "Bulk fill"],
        rating: 4.6
    },

    "dm-manager": {
        name: "DM Manager",
        description: "Manages and organizes direct messages.",
        icon: "MessageCircle",
        category: "Forms, Data & Automation",
        image: "/extension/dm-manager.png",
        chromeUrl: "#",
        features: ["Unified inbox", "Filters", "Templates"],
        rating: 4.6
    },
    "digital-wallet": {
        name: "Digital Wallet",
        description: "Stores and manages digital cards and info.",
        icon: "CreditCard",
        category: "Forms, Data & Automation",
        image: "/extension/digital-wallet.png",
        chromeUrl: "#",
        features: ["Encrypted storage", "Card visualization", "Auto-fill"],
        rating: 4.8
    },

    // --- Games & Fun Extensions ---
    "cube-game": {
        name: "Cube Game",
        description: "Simple interactive 3D cube game.",
        icon: "Box", // Generic icon
        category: "Games & Fun Extensions",
        image: "/extension/cube-game.png",
        chromeUrl: "#",
        features: ["3D controls", "Score tracking", "Offline play"],
        rating: 4.6
    },
    "mini-click-game": {
        name: "Mini Click Game",
        description: "Lightweight click-based casual game.",
        icon: "MousePointer",
        category: "Games & Fun Extensions",
        image: "/extension/mini-click-game.png",
        chromeUrl: "#",
        features: ["CPS test", "Time trials", "High score"],
        rating: 4.5
    },
    "moving-car-game": {
        name: "Moving Car Game",
        description: "Simple animated car movement game.",
        icon: "Car",
        category: "Games & Fun Extensions",
        image: "/extension/moving-car-game.png",
        chromeUrl: "#",
        features: ["Lane switching", "Obstacle avoidance", "Speed increase"],
        rating: 4.7
    },
    "spin-the-wheel": {
        name: "Spin the Wheel",
        description: "Random choice generator using spinning wheel.",
        icon: "Circle", // Or Disc
        category: "Games & Fun Extensions",
        image: "/extension/spin-the-wheel.png",
        chromeUrl: "#",
        features: ["Custom options", "Fair probability", "Sound effects"],
        rating: 4.8
    },
    "super-simple-highlighter": {
        name: "Super Simple Highlighter",
        description: "Highlights selected webpage text.",
        icon: "Highlighter",
        category: "Games & Fun Extensions", // User put it here, seems appropriate or Utility?
        chromeUrl: "#",
        features: ["Multiple colors", "Save highlights", "Remove highlights"],
        rating: 4.7,
        image: "/extension/super-simple-highlighter.png",
    },
    "quickshot": {
        name: "QuickShot",
        description: "Fast screenshot capture tool with minimal UI.",
        icon: "Camera",
        category: "Games & Fun Extensions", // User list had it here, but original was Productivity. Moving to match user list or keep logical? User put it at #58.
        // User list header was "Games & Fun Extensions" for #53-58.
        chromeUrl: "https://chromewebstore.google.com/detail/quickshot-advanced-screen/pakgfinjbmldnhflipghopjkgbhmooed",
        features: [
            "Capture entire screen, window, or region",
            "Instant sharing via link",
            "Built-in editor for annotation",
            "Cloud storage integration"
        ],
        rating: 4.7,
        image: "/extension/quickshot.png",
    },

    // --- Miscellaneous Tools ---
    "calendar-extension": {
        name: "Calendar Extension",
        description: "Simple calendar with date tracking.",
        icon: "CalendarDays",
        category: "Miscellaneous Tools",
        image: "/extension/calendar-extension.png",
        chromeUrl: "https://chromewebstore.google.com/detail/dynamic-calendar/ckefbgbogjljbeminicmbloiphneblkp",
        features: ["Event markers", "Quick view", "Sync ready"],
        rating: 4.6
    },
    "code-snippet-manager": {
        name: "Code Snippet Manager",
        description: "Saves and manages reusable code snippets.",
        icon: "Code2",
        category: "Miscellaneous Tools",
        image: "/extension/code-snippet-manager.png",
        chromeUrl: "#",
        features: ["Language detection", "Syntax highlighting", "One-click copy"],
        rating: 4.8
    },

    "poll-maker": {
        name: "Poll Maker",
        description: "Creates quick polls and surveys.",
        icon: "ListChecks",
        category: "Miscellaneous Tools",
        image: "/extension/poll-maker.png",
        chromeUrl: "#",
        features: ["Shareable links", "Real-time results", "Anonymous voting"],
        rating: 4.6
    },
    "quiz-generator": {
        name: "Quiz Generator",
        description: "Builds quizzes from user input.",
        icon: "HelpCircle", // Question mark
        category: "Miscellaneous Tools",
        image: "/extension/quiz-generator.png",
        chromeUrl: "#",
        features: ["Multiple choice", "Score calculation", "Timer option"],
        rating: 4.7
    },
    "jobshield-extension": {
        name: "JobShield Extension",
        description: "Helps manage job application data securely.",
        icon: "Shield", // Or Briefcase
        category: "Miscellaneous Tools",
        image: "/extension/jobshield-extension.png",
        chromeUrl: "#",
        features: ["Data encryption", "Application tracker", "Auto-fill secure"],
        rating: 4.9
    },

    // --- New Added Extensions ---

    // Utilities & Calculators
    "volume-master-pro": {
        name: "Volume Master Pro",
        description: "Per-tab volume control with sound amplification.",
        icon: "Volume2",
        category: "Utilities & Calculators",
        image: "/extension/volume-master-pro.png",
        chromeUrl: "#",
        features: ["Boost volume", "Per-tab control", "Audio visualizer"],
        rating: 4.8
    },
    "world-time-desk": {
        name: "World Time Desk",
        description: "View multiple country time zones in one place.",
        icon: "Globe",
        category: "Utilities & Calculators",
        image: "/extension/world-time-desk.png",
        chromeUrl: "#",
        features: ["Multiple clocks", "Time difference", "Day/Night view"],
        rating: 4.7
    },
    "floating-analog-watch": {
        name: "Floating Analog Watch",
        description: "Always-on-top floating analog clock.",
        icon: "Clock",
        category: "Utilities & Calculators",
        image: "/extension/floating-analog-watch.png",
        chromeUrl: "#",
        features: ["Floating overlay", "Customizable skins", "Always on top"],
        rating: 4.6
    },

    // Text, Writing & Content
    "instant-dictionary": {
        name: "Instant Dictionary",
        description: "Get meanings, synonyms & pronunciation instantly.",
        icon: "Book",
        category: "Text, Writing & Content",
        image: "/extension/instant-dictionary.png",
        chromeUrl: "#",
        features: ["Double-click lookup", "Synonyms", "Pronunciation audio"],
        rating: 4.8
    },
    "text-to-pdf-converter": {
        name: "Text to PDF Converter",
        description: "Convert written text into downloadable PDF files.",
        icon: "FileText",
        category: "Text, Writing & Content",
        image: "/extension/text-to-pdf-converter.png",
        chromeUrl: "#",
        features: ["Custom formatting", "Instant download", "Privacy focused"],
        rating: 4.7
    },
    "secure-message-encryptor": {
        name: "Secure Message Encryptor",
        description: "Encrypt & decrypt messages for privacy.",
        icon: "Lock",
        category: "Text, Writing & Content",
        image: "/extension/secure-message-encryptor.png",
        chromeUrl: "https://chromewebstore.google.com/detail/message-encryptor-decrypt/jdooknlinppkaciojpmcamlhiiaeonbc",
        features: ["AES-256 encryption", "Password protection", "Shareable links"],
        rating: 4.9
    },
    "just-read-mode": {
        name: "Just Read Mode",
        description: "Distraction-free reader mode for webpages.",
        icon: "BookOpen",
        category: "Text, Writing & Content",
        image: "/extension/just-read-mode.png",
        chromeUrl: "#",
        features: ["Remove ads", "Adjust fonts", "Dark mode"],
        rating: 4.8
    },
    "email-extractor-pro": {
        name: "Email Extractor Pro",
        description: "Extract email addresses from webpages.",
        icon: "AtSign",
        category: "Text, Writing & Content",
        image: "/extension/email-extractor-pro.png",
        chromeUrl: "#",
        features: ["Bulk extraction", "Export to CSV", "Filter options"],
        rating: 4.6
    },


    // Media & Image Tools
    "image-download-helper": {
        name: "Image Download Helper",
        description: "Bulk download images from any webpage.",
        icon: "Download",
        category: "Media & Image Tools",
        image: "/extension/image-download-helper.png",
        chromeUrl: "#",
        features: ["Filter by size", "Select all", "One-click download"],
        rating: 4.8
    },
    "draw-pencil": {
        name: "Draw Pencil",
        description: "Simple sketching and drawing tool in browser.",
        icon: "Pen",
        category: "Media & Image Tools",
        image: "/extension/draw-pencil.png",
        chromeUrl: "#",
        features: ["Freehand drawing", "Color palette", "Save as PNG"],
        rating: 4.5
    },

    // Analytics, Web & SEO
    "price-tracker": {
        name: "Price Tracker",
        description: "Track product price changes over time.",
        icon: "Tag",
        category: "Analytics, Web & SEO",
        image: "/extension/price-tracker.png",
        chromeUrl: "#",
        features: ["Price history", "Drop alerts", "Multi-store support"],
        rating: 4.8
    },

    "hosting-renewal-alert": {
        name: "Hosting Renewal Alert",
        description: "Get alerts before hosting or domain expiry.",
        icon: "Server",
        category: "Analytics, Web & SEO",
        image: "/extension/hosting-renewal-alert.png",
        chromeUrl: "#",
        features: ["Domain tracking", "SSL expiry", "Email notifications"],
        rating: 4.6
    },
    "url-shortener": {
        name: "URL Shortener",
        description: "Generate short, shareable URLs instantly.",
        icon: "Link",
        category: "Analytics, Web & SEO",
        image: "/extension/url-shortener.png",
        chromeUrl: "https://chromewebstore.google.com/detail/url-shortener/eapmpejmhfgjmagkfbjpmmbhppfljeom",
        features: ["Click tracking", "Custom alias", "QR code generation"],
        rating: 4.8
    },

    // Forms, Data & Automation
    "auto-question-extractor": {
        name: "Auto Question Extractor",
        description: "Extract questions from text or PDFs automatically.",
        icon: "HelpCircle", // Use HelpCircle as generic question icon
        category: "Forms, Data & Automation",
        image: "/extension/auto-question-extractor.png",
        chromeUrl: "#",
        features: ["PDF support", "Export to text", "Context matching"],
        rating: 4.7
    },

    // Productivity & Focus
    "quick-link-manager": {
        name: "Quick Link Manager",
        description: "Save and open frequently used links.",
        icon: "Link2",
        category: "Productivity & Focus",
        image: "/extension/quick-link-manager.png",
        chromeUrl: "#",
        features: ["Group links", "One-click open", "Cloud sync"],
        rating: 4.6
    },
    "sticky-notes": {
        name: "Sticky Notes",
        description: "Floating notes for quick reminders.",
        icon: "StickyNote",
        category: "Productivity & Focus",
        image: "/extension/sticky-notes.png",
        chromeUrl: "#",
        features: ["Color coding", "Auto-save", "Stay on top"],
        rating: 4.8
    },
    "open-incognito": {
        name: "Open Incognito",
        description: "One-click incognito window launcher.",
        icon: "EyeOff",
        category: "Productivity & Focus",
        image: "/extension/open-incognito.png",
        chromeUrl: "#",
        features: ["Context menu", "Keyboard shortcut", "History protection"],
        rating: 4.9
    },
    "freeslots-scheduler": {
        name: "FreeSlots Scheduler",
        description: "Simple scheduler to manage free time & meetings.",
        icon: "CalendarClock", // Assuming generic Calendar icon if CalendarClock not available, but user wants scheduler. Calendar is safe.
        category: "Productivity & Focus",
        image: "/extension/freeslots-scheduler.png",
        chromeUrl: "#",
        features: ["Find gaps", "Meeting planner", "Timezone support"],
        rating: 4.7
    },

    // --- User Requested Extensions ---


    "cookie-expiry-monitor": {
        name: "Cookie Expiry Monitor",
        description: "Monitor and manage browser cookie expiration dates.",
        icon: "Cookie",
        category: "Analytics, Web & SEO",
        image: "/extension/cookie-expiry-monitor.png",
        chromeUrl: "#",
        features: ["Expiry alerts", "Cookie cleanup", "Privacy score"],
        rating: 4.6
    },
    "grocery-list-builder": {
        name: "Grocery List Builder",
        description: "Smart grocery list maker with price estimation.",
        icon: "ShoppingCart",
        category: "Productivity & Focus",
        image: "/extension/grocery-list-builder.png",
        chromeUrl: "#",
        features: ["Quick add", "Categorization", "Budget tracking"],
        rating: 4.5
    },
    "api-tester": {
        name: "API Tester Extension",
        description: "Test REST APIs directly from your browser.",
        icon: "Server",
        category: "File, Data & Formatter Tools",
        image: "/extension/api-tester.png",
        chromeUrl: "https://chromewebstore.google.com/detail/api-tester-pro/feopehddfpeghlkgflgaaphbgjgflnli",
        features: ["GET/POST requests", "JSON viewer", "History log"],
        rating: 4.9
    },
    "bookmark-manager": {
        name: "Bookmark Manager",
        description: "Organize and sync bookmarks efficiently.",
        icon: "Bookmark",
        category: "Productivity & Focus",
        image: "/extension/bookmark-manager.png",
        chromeUrl: "#",
        features: ["Folder organization", "Cloud sync", "Duplicate remover"],
        rating: 4.7
    },
    "code-puzzle": {
        name: "Code Puzzle",
        description: "Daily coding puzzles to sharpen your skills.",
        icon: "Puzzle",
        category: "Games & Fun Extensions",
        image: "/extension/code-puzzle.png",
        chromeUrl: "#",
        features: ["Daily challenges", "Syntax highlighting", "Leaderboard"],
        rating: 4.8
    },
    "cover-letter-generator": {
        name: "Cover Letter Generator",
        description: "Generate professional cover letters with AI.",
        icon: "FileText",
        category: "Text, Writing & Content",
        image: "/extension/cover-letter-generator.png",
        chromeUrl: "#",
        features: ["AI writing", "Templates", "Keyword optimization"],
        rating: 4.7
    },
    "eye-guardian": {
        name: "Eye Guardian",
        description: "Protects your eyes with blue light filter and break reminders.",
        icon: "Eye",
        category: "Productivity & Focus",
        image: "/extension/eye-guardian.png",
        chromeUrl: "#",
        features: ["Blue light filter", "Break timer", "Health stats"],
        rating: 4.9
    },
    "website-preview-generator": {
        name: "Generate Website Preview",
        description: "Instant preview of any website URL on hover.",
        icon: "Layout",
        category: "Analytics, Web & SEO",
        image: "/extension/website-preview-generator.png",
        chromeUrl: "#",
        features: ["Hover preview", "Safe browsing", "Mobile view"],
        rating: 4.6
    },
    "icon-extractor": {
        name: "Icon Extractor",
        description: "Extract icons and favicons from websites.",
        icon: "Image",
        category: "Design & CSS Tools",
        image: "/extension/icon-extractor.png",
        chromeUrl: "#",
        features: ["One-click extract", "SVG support", "Zip download"],
        rating: 4.5
    },
    "info-save": {
        name: "Info Save",
        description: "Save important snippets and info for later.",
        icon: "Save",
        category: "Productivity & Focus",
        image: "/extension/info-save.png",
        chromeUrl: "#",
        features: ["Quick save", "Tags", "Offline access"],
        rating: 4.6
    },
    "mandala-artist": {
        name: "Mandala Artist Extension",
        description: "Create relaxing mandala art in your browser.",
        icon: "Palette",
        category: "Games & Fun Extensions",
        image: "/extension/mandala-artist.png",
        chromeUrl: "#",
        features: ["Symmetry tools", "Color palettes", "Export art"],
        rating: 4.8
    },
    "puzzle-pulse-pro": {
        name: "Puzzle Pulse Pro",
        description: "Advanced brain teasers and logic puzzles.",
        icon: "Puzzle",
        category: "Games & Fun Extensions",
        image: "/extension/puzzle-pulse-pro.png",
        chromeUrl: "#",
        features: ["Logic puzzles", " Daily challenges", "Brain training"],
        rating: 4.8
    },
    "random-password-generator": {
        name: "Random Password Generator",
        description: "Generate secure, random passwords instantly.",
        icon: "Key",
        category: "Utilities & Calculators",
        image: "/extension/random-password-generator.png",
        chromeUrl: "#",
        features: ["Custom length", "Symbol options", "Copy to clipboard"],
        rating: 4.9
    },
    "tab-manager-pro": {
        name: "Tab Manager Pro",
        description: "Manage open tabs and reduce memory usage.",
        icon: "Layers",
        category: "Productivity & Focus",
        image: "/extension/tab-manager-pro.png",
        chromeUrl: "#",
        features: ["Tab grouping", "Memory saver", "Search tabs"],
        rating: 4.8
    },
    "text-case-converter": {
        name: "Text Case Converter",
        description: "Convert text between different cases easily.",
        icon: "Type",
        category: "Text, Writing & Content",
        image: "/extension/text-case-converter.png",
        chromeUrl: "#",
        features: ["UPPERCASE", "lowercase", "Title Case", "camelCase"],
        rating: 4.5
    },
    "totp-authenticator": {
        name: "TOTP Authenticator",
        description: "Secure 2FA code generator for your browser.",
        icon: "ShieldCheck",
        category: "Utilities & Calculators",
        image: "/extension/totp-authenticator.png",
        chromeUrl: "#",
        features: ["QR code scan", "Encrypted storage", "Backup support"],
        rating: 4.9
    },
    "qr-code-generator": {
        name: "QR Code Generator",
        description: "Generate custom QR codes for URLs, text, and wifi.",
        icon: "QrCode",
        category: "Utilities & Calculators",
        image: "/extension/qr-code-generator.png",
        chromeUrl: "https://chromewebstore.google.com/detail/qr-code-generator/gfnjjjnfigeijkemjakibagldhadcoho",
        features: ["Custom colors", "Logo support", "High resolution download"],
        rating: 4.8
    },
    "word-typing-game": {
        name: "Word Typing Game Extension",
        description: "Test your typing speed with this interactive game.",
        icon: "Keyboard",
        category: "Games & Fun Extensions",
        image: "/extension/word-typing-game.png",
        chromeUrl: "#",
        features: ["WPM calculator", "Difficulty levels", "Score tracking"],
        rating: 4.7
    },
    "random-comment-generator": {
        name: "Random Comment Generator Extension",
        description: "Generate random, relevant comments for social media.",
        icon: "MessageSquare",
        category: "Text, Writing & Content",
        image: "/extension/random-comment-generator.png",
        chromeUrl: "#",
        features: ["Context aware", "Multiple tones", "One-click copy"],
        rating: 4.6
    },
    "utm-link-builder": {
        name: "UTM Link Builder",
        description: "Easily build and manage UTM tracking links.",
        icon: "Link2",
        category: "Analytics, Web & SEO",
        image: "/extension/utm-link-builder.png",
        chromeUrl: "#",
        features: ["Preset parameters", "Shorten URL", "Campaign history"],
        rating: 4.8
    },

    // User Requested Extensions
    "clipboard-history-manager": {
        name: "Clipboard History Manager",
        description: "Saves everything you copy (text, links, images) and lets you view, search, and reuse past items.",
        icon: "ClipboardList",
        category: "Productivity & Focus",
        image: "/extension/clipboard-history-manager.png",
        chromeUrl: "#",
        features: ["Saves text, links, and images", "Search past items", "One-click reuse"],
        rating: 4.7
    },
    "gitignore-extension": {
        name: "GitIgnore Extension",
        description: "Helps generate and manage .gitignore files for Git projects with suggested ignores.",
        icon: "FileX",
        category: "File, Data & Formatter Tools",
        image: "/extension/gitignore-extension.png",
        chromeUrl: "https://chromewebstore.google.com/detail/gitignore-generator-pro/hkhjfpmcgmgdgndjncckhbafobpbipgp",
        features: ["Auto-generate .gitignore", "Project type suggestions", "Quick management"],
        rating: 4.8
    },
    "extension-manager-browser": {
        name: "Extension Manager (Browser)",
        description: "Enables or disables browser extensions easily and organizes them into custom profiles.",
        icon: "Settings2",
        category: "Productivity & Focus",
        image: "/extension/extension-manager-browser.png",
        chromeUrl: "https://chromewebstore.google.com/detail/extension-manager/ebabeaaaaopcjniffgjdneklbnmnmmal",
        features: ["Easy enable/disable", "Custom profiles", "Performance monitoring"],
        rating: 4.6
    },
    "password-manager-lite": {
        name: "Password Manager Lite",
        description: "Stores passwords securely and generates strong passwords for your accounts.",
        icon: "KeyRound",
        category: "Forms, Data & Automation",
        image: "/extension/password-manager-lite.png",
        chromeUrl: "#",
        features: ["Secure storage", "Password generator", "Encryption"],
        rating: 4.5
    },
    "todo-tab-extension": {
        name: "Todo Tab Extension",
        description: "Replaces your new tab page with a to-do list with reminders and progress tracking.",
        icon: "ListTodo",
        category: "Productivity & Focus",
        image: "/extension/todo-tab-extension.png",
        chromeUrl: "#",
        features: ["Custom tab page", "Daily task tracking", "Reminders & checklists"],
        rating: 4.9
    },
    "simple-music-player": {
        name: "Simple Music Player",
        description: "Lightweight music player that lets you play music directly from your browser.",
        icon: "Headphones",
        category: "Miscellaneous Tools",
        image: "/extension/simple-music-player.png",
        chromeUrl: "#",
        features: ["Playback controls", "Lightweight design", "Local file support"],
        rating: 4.4
    },
};

/**
 * Returns extensions sorted so that extensions with a real Chrome Web Store URL
 * appear first. Extensions with chromeUrl === "#" or no chromeUrl are placed after.
 * Within each group, the original order is preserved.
 */
export function getSortedExtensions() {
    return Object.entries(extensionMap)
        .map(([slug, data]) => ({ slug, ...data }))
        .sort((a, b) => {
            const aHasUrl = a.chromeUrl && a.chromeUrl !== "#" ? 1 : 0;
            const bHasUrl = b.chromeUrl && b.chromeUrl !== "#" ? 1 : 0;
            return bHasUrl - aHasUrl; // URL wale pehle aayenge
        });
}
