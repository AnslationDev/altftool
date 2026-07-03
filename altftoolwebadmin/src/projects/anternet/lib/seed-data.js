"use client";

/**
 * Anternet seed content — ported 1:1 from the app's previously hardcoded data
 * (src/data/tasks.js, src/data/quizQuestions.js, LuckySpinScreen, Profile).
 * Used by Seed Migration to make the panel the single source of truth,
 * and kept as the app-side fallback contract.
 */

export const BANNERS = [
  { id: "slide-1", title: "Play & Win", imageUrl: "https://firebasestorage.googleapis.com/v0/b/insent-app-9bf95.firebasestorage.app/o/Insent-images%2Fhome-page%2Fdailyspinbanner.png?alt=media&token=008641c8-51fc-452c-9443-582f91185b2a", ctaAction: "spin", order: 0, active: true },
  { id: "slide-2", title: "Play & Win", imageUrl: "https://firebasestorage.googleapis.com/v0/b/insent-app-9bf95.firebasestorage.app/o/Insent-images%2Fhome-page%2Fdailyspinbanner.png?alt=media&token=008641c8-51fc-452c-9443-582f91185b2a", ctaAction: "spin", order: 1, active: true },
  { id: "slide-3", title: "Play & Win", imageUrl: "https://firebasestorage.googleapis.com/v0/b/insent-app-9bf95.firebasestorage.app/o/Insent-images%2Fhome-page%2Fdailyspinbanner.png?alt=media&token=008641c8-51fc-452c-9443-582f91185b2a", ctaAction: "spin", order: 2, active: true },
  { id: "slide-4", title: "Play & Win", imageUrl: "https://firebasestorage.googleapis.com/v0/b/insent-app-9bf95.firebasestorage.app/o/Insent-images%2Fhome-page%2Fdailyspinbanner.png?alt=media&token=008641c8-51fc-452c-9443-582f91185b2a", ctaAction: "spin", order: 3, active: true },
];

export const TASKS = [
  // Tasks screen grid cards
  { id: "video", title: "Watch Video", section: "grid", category: "Entertainment", rating: "98%", playCount: "84.6K", heat: 3, coins: 25, image: "https://cdn-icons-png.flaticon.com/128/17500/17500837.png", order: 0, active: true },
  { id: "spin", title: "Spin Wheel", section: "grid", category: "Games", rating: "92%", playCount: "289.2K", heat: 2, coins: 100, image: "https://cdn-icons-png.flaticon.com/128/4179/4179374.png", order: 1, active: true },
  { id: "dailyLogin", title: "Daily Login", section: "grid", category: "All", rating: "96%", playCount: "690.6K", heat: 3, coins: 50, image: "https://cdn-icons-png.flaticon.com/128/16979/16979280.png", order: 2, active: true },
  { id: "feedback", title: "Feedback", section: "grid", category: "Engagement", rating: "87%", playCount: "27.6K", heat: 1, coins: 30, image: "https://cdn-icons-png.flaticon.com/128/10456/10456465.png", order: 3, active: true },
  { id: "tictactoe", title: "Tic Tac Toe", section: "grid", category: "Games", rating: "94%", playCount: "15.2K", heat: 2, image: "https://cdn-icons-png.flaticon.com/128/1021/1021835.png", order: 4, active: true },
  { id: "snakegame", title: "Snake Game", section: "grid", category: "Games", rating: "99%", playCount: "1.2M", heat: 3, image: "https://cdn-icons-png.flaticon.com/128/8277/8277666.png", order: 5, active: true },
  { id: "referral", title: "Refer & Earn", section: "grid", category: "Games", rating: "99%", playCount: "1.2M", heat: 3, coins: 200, image: "https://cdn-icons-png.flaticon.com/128/11320/11320169.png", order: 6, active: true },
  { id: "slidingpuzzle", title: "Sliding Puzzle", section: "grid", category: "Games", rating: "99%", playCount: "1.2M", heat: 1, image: "https://cdn-icons-png.flaticon.com/128/3770/3770214.png", order: 7, active: true },
  { id: "memoryflipgame", title: "Card Flip Game", section: "grid", category: "Games", rating: "99%", playCount: "1.2M", heat: 1, image: "https://cdn-icons-png.flaticon.com/128/17504/17504464.png", order: 8, active: true },
  { id: "truthanddare", title: "Truth and dare", section: "grid", category: "Games", rating: "99%", playCount: "1.2M", heat: 1, image: "https://cdn-icons-png.flaticon.com/128/7047/7047661.png", order: 9, active: true },
  { id: "aiquiz", title: "Quiz Game", section: "grid", category: "Games", rating: "99%", playCount: "1.2M", heat: 1, coins: 75, image: "https://cdn-icons-png.flaticon.com/128/3261/3261308.png", order: 10, active: true },
  // Home "Daily Tasks" list
  { id: "daily-login-home", title: "Daily Login", section: "daily", category: "Daily Tasks", rating: "4.8", coins: 50, description: "Login every day to earn bonus coins.", icon: "ArrowRightToLine", order: 0, active: true },
  { id: "video-home", title: "Video Rewards", section: "daily", category: "Entertainment", rating: "4.6", coins: 25, description: "Watch short videos and earn coins.", icon: "Film", order: 1, active: true },
  { id: "spin-home", title: "Lucky Spin", section: "daily", category: "Games", rating: "4.9", coins: 100, description: "Spin the wheel and win rewards.", icon: "RefreshCw", order: 2, active: true },
  { id: "referral-home", title: "Referral Program", section: "daily", category: "Social", rating: "4.7", coins: 200, description: "Invite friends and earn together.", icon: "Users", order: 3, active: true },
  { id: "quiz-home", title: "Take Quiz", section: "daily", category: "Knowledge", rating: "4.5", coins: 75, description: "Answer 5 simple questions.", icon: "FileQuestion", order: 4, active: true },
];

export const QUIZ_CATEGORIES = [
  { id: "nature", name: "Nature", colorFrom: "#134E4A", colorTo: "#2DD4BF", icon: "https://cdn-icons-png.flaticon.com/128/4729/4729446.png", order: 0, active: true },
  { id: "science", name: "Science", colorFrom: "#1E3A8A", colorTo: "#3B82F6", icon: "https://cdn-icons-png.flaticon.com/128/10296/10296400.png", order: 1, active: true },
  { id: "fashion", name: "Fashion", colorFrom: "#581C87", colorTo: "#A855F7", icon: "https://cdn-icons-png.flaticon.com/128/3050/3050239.png", order: 2, active: true },
  { id: "movies", name: "Movies", colorFrom: "#78350F", colorTo: "#F59E0B", icon: "https://cdn-icons-png.flaticon.com/128/3800/3800018.png", order: 3, active: true },
  { id: "general", name: "General Knowledge", colorFrom: "#0F766E", colorTo: "#22D3EE", icon: "https://cdn-icons-png.flaticon.com/128/2641/2641457.png", order: 4, active: true },
];

export const QUESTIONS = [
  { id: "nature-q1", question: "Which gas do plants absorb from the atmosphere for photosynthesis?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correctAnswer: "Carbon Dioxide", category: "nature", coins: 10, active: true },
  { id: "nature-q2", question: "What is the largest rainforest in the world?", options: ["Amazon", "Congo", "Daintree", "Southeast Asian"], correctAnswer: "Amazon", category: "nature", coins: 10, active: true },
  { id: "science-q3", question: "What is the chemical symbol for Gold?", options: ["Gd", "Ag", "Au", "Fe"], correctAnswer: "Au", category: "science", coins: 10, active: true },
  { id: "science-q4", question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctAnswer: "Mars", category: "science", coins: 10, active: true },
  { id: "fashion-q5", question: "Who popularized the concept of the 'Little Black Dress' in the 1920s?", options: ["Donatella Versace", "Coco Chanel", "Vivienne Westwood", "Miuccia Prada"], correctAnswer: "Coco Chanel", category: "fashion", coins: 10, active: true },
  { id: "fashion-q6", question: "Which city is known as the 'Fashion Capital of the World'?", options: ["London", "Paris", "Milan", "New York"], correctAnswer: "Paris", category: "fashion", coins: 10, active: true },
  { id: "movies-q7", question: "Which movie won the first ever Academy Award for Best Picture?", options: ["Wings", "Sunrise", "The Jazz Singer", "Metropolis"], correctAnswer: "Wings", category: "movies", coins: 10, active: true },
  { id: "movies-q8", question: "Who directed the movie 'Interstellar'?", options: ["Steven Spielberg", "James Cameron", "Christopher Nolan", "Ridley Scott"], correctAnswer: "Christopher Nolan", category: "movies", coins: 10, active: true },
  { id: "gen-q1", question: "What is the capital of France?", options: ["Paris", "Berlin", "Madrid", "Rome"], correctAnswer: "Paris", category: "general", coins: 10, active: true },
  { id: "gen-q2", question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], correctAnswer: "Mars", category: "general", coins: 10, active: true },
  { id: "gen-q3", question: "Who wrote 'To Kill a Mockingbird'?", options: ["Harper Lee", "J.K. Rowling", "Ernest Hemingway", "Mark Twain"], correctAnswer: "Harper Lee", category: "general", coins: 10, active: true },
  { id: "gen-q4", question: "What is the chemical symbol for water?", options: ["W", "H\\u2082O", "O\\u2082", "HO"], correctAnswer: "H\\u2082O", category: "general", coins: 10, active: true },
  { id: "gen-q5", question: "Which country hosted the 2020 Summer Olympics?", options: ["China", "Japan", "Brazil", "United Kingdom"], correctAnswer: "Japan", category: "general", coins: 10, active: true },
];

export const SPIN_PRIZES = [
  { id: "better-luck", label: "Better Luck", type: "fail", value: 0, img: "https://cdn-icons-png.flaticon.com/512/6711/6711613.png", weight: 3, order: 0, active: true },
  { id: "amazon-50", label: "Amazon 50% OFF", type: "coupon", code: "AMZ50", value: 0, img: "https://img.icons8.com/color/48/000000/amazon.png", weight: 1, order: 1, active: true },
  { id: "nike-20", label: "Nike 20% OFF", type: "coupon", code: "NIKE20", value: 0, img: "https://cdn-icons-png.flaticon.com/512/732/732229.png", weight: 1, order: 2, active: true },
  { id: "coins-100", label: "100 Coins", type: "coins", value: 100, img: "https://cdn-icons-png.flaticon.com/512/1292/1292744.png", weight: 2, order: 3, active: true },
  { id: "try-next-time", label: "Try Next Time", type: "fail", value: 0, img: "https://cdn-icons-png.flaticon.com/512/6711/6711613.png", weight: 3, order: 4, active: true },
  { id: "coins-500", label: "500 Coins", type: "coins", value: 500, img: "https://cdn-icons-png.flaticon.com/512/1292/1292744.png", weight: 1, order: 5, active: true },
  { id: "starbucks-bogo", label: "Starbucks BOGO", type: "coupon", code: "COFFEE", value: 0, img: "https://cdn-icons-png.flaticon.com/512/5977/5977591.png", weight: 1, order: 6, active: true },
  { id: "coins-200", label: "200 Coins", type: "coins", value: 200, img: "https://cdn-icons-png.flaticon.com/512/1292/1292744.png", weight: 2, order: 7, active: true },
  { id: "no-reward", label: "No Reward", type: "fail", value: 0, img: "https://cdn-icons-png.flaticon.com/512/6711/6711613.png", weight: 3, order: 8, active: true },
  { id: "netflix-1m", label: "Netflix 1 Month", type: "coupon", code: "STREAM", value: 0, img: "https://cdn-icons-png.flaticon.com/512/5977/5977590.png", weight: 1, order: 9, active: true },
  { id: "coins-1000", label: "1000 Coins", type: "coins", value: 1000, img: "https://cdn-icons-png.flaticon.com/512/1292/1292744.png", weight: 1, order: 10, active: true },
  { id: "uber-25", label: "Uber 25% OFF", type: "coupon", code: "RIDE25", value: 0, img: "https://img.icons8.com/ios-filled/50/000000/uber.png", weight: 1, order: 11, active: true },
];

export const VIDEO_SECTIONS = [
  { id: "trendy", title: "Trendy", videos: [{ videoId: "1hHMwLxN6EM", title: "How to Plan an MVP", channel: "Y Combinator", views: "3.1M views", duration: "5:28", reward: "15" }, { videoId: "E7wJTI-1dvQ", title: "Build YouTube in React", channel: "Jan Goebel", views: "1.4M views", duration: "12:42", reward: "20" }, { videoId: "M7lc1UVf-VE", title: "Embedded Web Player Customization", channel: "Google for Developers", views: "980K views", duration: "7:57", reward: "10" }, { videoId: "2ePf9rue1Ao", title: "Artificial Intelligence in 5 Minutes", channel: "Dr. Raj Ramesh", views: "3.4M views", duration: "5:17", reward: "25" }, { videoId: "p7HKvqRI_Bo", title: "How the Stock Market Works", channel: "TED-Ed", views: "850K views", duration: "4:29", reward: "30" }], order: 0, active: true },
  { id: "educational", title: "Educational", videos: [{ videoId: "iDbdXTMnOmE", title: "The Science of Learning Effectively 🧠", channel: "TED-Ed", views: "2.9M views", duration: "6:45", reward: "15" }, { videoId: "2ePf9rue1Ao", title: "Artificial Intelligence in 5 Minutes", channel: "ColdFusion", views: "4.7M views", duration: "5:17", reward: "25" }, { videoId: "p7HKvqRI_Bo", title: "How the Stock Market Works 📈", channel: "The Plain Bagel", views: "1.5M views", duration: "8:30", reward: "20" }, { videoId: "21eFwbb48sE", title: "History of the Internet 🌐", channel: "Kurzgesagt – In a Nutshell", views: "9.2M views", duration: "7:21", reward: "30" }], order: 1, active: true },
  { id: "travel", title: "Travel", videos: [{ videoId: "V-_O7nl0Ii0", title: "Nice Ocean Waves", channel: "John Frye", views: "3.1M views", duration: "3:24", reward: "25" }, { videoId: "ysz5S6PUM-U", title: "Chilled Serenity", channel: "Xquisite", views: "1.8M views", duration: "3:36", reward: "15" }, { videoId: "WhWc3b3KhnY", title: "Spring Open Movie", channel: "Blender Studio", views: "4.2M views", duration: "7:44", reward: "30" }, { videoId: "R6MlUcmOul8", title: "Tears of Steel", channel: "Blender", views: "2.9M views", duration: "12:14", reward: "20" }], order: 2, active: true },
  { id: "recommended", title: "Recommended", videos: [{ videoId: "M7lc1UVf-VE", title: "Embedded Video Player Tips", channel: "Google for Developers", views: "12K views", duration: "7:57", reward: "10" }, { videoId: "YE7VzlLtp-4", title: "Big Buck Bunny", channel: "Blender", views: "18K views", duration: "9:57", reward: "15" }, { videoId: "eRsGyueVLvQ", title: "Sintel Open Movie", channel: "Blender", views: "25K views", duration: "14:48", reward: "20" }, { videoId: "WhWc3b3KhnY", title: "Spring Open Movie", channel: "Blender Studio", views: "9.5K views", duration: "7:44", reward: "25" }, { videoId: "R6MlUcmOul8", title: "Tears of Steel", channel: "Blender", views: "30K views", duration: "12:14", reward: "30" }], order: 3, active: true },
  { id: "funny", title: "Funny", videos: [{ videoId: "YE7VzlLtp-4", title: "Big Buck Bunny", channel: "Blender", views: "4.5M views", duration: "9:57", reward: "20" }, { videoId: "aqz-KE-bpKQ", title: "Big Buck Bunny 4K", channel: "Blender", views: "2.6M views", duration: "10:35", reward: "10" }, { videoId: "jNQXAC9IVRw", title: "Me at the Zoo", channel: "jawed", views: "4.1M views", duration: "0:19", reward: "25" }, { videoId: "M3r2XDceM6A", title: "Amazing Nintendo Facts", channel: "ZackScott", views: "7.5M views", duration: "5:13", reward: "30" }, { videoId: "WhWc3b3KhnY", title: "Spring Open Movie", channel: "Blender Studio", views: "6.2M views", duration: "7:44", reward: "15" }, { videoId: "eRsGyueVLvQ", title: "Sintel Open Movie", channel: "Blender", views: "3.9M views", duration: "14:48", reward: "20" }, { videoId: "R6MlUcmOul8", title: "Tears of Steel", channel: "Blender", views: "2.2M views", duration: "12:14", reward: "10" }], order: 4, active: true },
];

export const EARNING_TASKS = [
  { id: "watch-videos", title: "Watch Videos", desc: "Get 10 coins for every 30-second video you watch.", icon: "https://cdn-icons-png.flaticon.com/128/1179/1179069.png", reward: "+10", action: "videos", order: 0, active: true },
  { id: "play-games", title: "Play Games", desc: "Reach new levels in featured games to earn big.", icon: "https://cdn-icons-png.flaticon.com/128/686/686588.png", reward: "+200", action: "games", order: 1, active: true },
  { id: "give-feedback", title: "Give Feedback", desc: "Rate your experience and help us improve.", icon: "https://cdn-icons-png.flaticon.com/128/2058/2058197.png", reward: "+30", action: "feedback", order: 2, active: true },
  { id: "invite-friends", title: "Invite Friends", desc: "Earn 50 coins instantly when a friend signs up.", icon: "https://cdn-icons-png.flaticon.com/128/3239/3239952.png", reward: "+50", action: "invite", order: 3, active: true },
  { id: "daily-bonus", title: "Daily Bonus", desc: "Log in every day to claim your streak rewards.", icon: "https://cdn-icons-png.flaticon.com/128/566/566445.png", reward: "+5", action: "daily", order: 4, active: true },
  { id: "follow-socials", title: "Follow Socials", desc: "Follow our official handles for bonus rewards.", icon: "https://cdn-icons-png.flaticon.com/128/2111/2111463.png", reward: "+20", action: "social", order: 5, active: true },
  { id: "complete-profile", title: "Complete Profile", desc: "Fill in all your details to verify your account.", icon: "https://cdn-icons-png.flaticon.com/128/10412/10412383.png", reward: "+100", action: "profile", order: 6, active: true },
];

export const APP_CONFIG = {
  appName: "Anternet",
  maintenanceMode: false,
  maintenanceMessage: "",
  latestVersion: "1.0.0",
  minSupportedVersion: "1.0.0",
  updateUrl: "",
  supportEmail: "support@anslation.com",
};

export const FEATURE_FLAGS = {
  flags: {
    luckySpinEnabled: "true",
    quizEnabled: "true",
    videoRewardsEnabled: "true",
    referralEnabled: "true",
    walletEnabled: "true",
  },
};

export const REWARD_RULES = {
  dailyLoginCoins: 50,
  videoWatchCoins: 10,
  referralCoins: 50,
  quizCorrectCoins: 10,
  spinCooldownMinutes: 60,
  coinToInrRate: 100,
};

export const ADS = [
  { id: "refer-earn-banner", placement: "home-refer-earn", title: "Refer & Earn", cta: "", action: "referral", imageUrl: "", order: 0, active: true },
  { id: "ttt-banner", placement: "home-ttt", badge: "FEATURED", title: "TIC TAC TOE", cta: "PLAY NOW", action: "tictactoe", imageUrl: "", order: 1, active: true },
];

export const PAGES = [
  { id: "privacy-policy", title: "Privacy Policy", order: 0, active: true, sections: [
    { title: "Data Collection", icon: "Database", color: "#38BDF8", content: "We collect information you provide directly, such as your name, email, and registration details." },
    { title: "Usage Policy", icon: "Info", color: "#818CF8", content: "Your data is used to personalize content and manage rewards. We never sell your information." },
    { title: "Security", icon: "Lock", color: "#FB7185", content: "We implement secure storage and data encryption to protect your personal information." },
    { title: "User Rights", icon: "UserCheck", color: "#34D399", content: "You have full control. Update your profile or request data deletion anytime via support." },
    { title: "Third-Parties", icon: "Shield", color: "#FBBF24", content: "We use trusted services for analytics. Each follows its own policy which we recommend reviewing." },
  ] },
];

export const NOTIFICATIONS = [];

export const INTEGRATIONS = {
  youtubeApiKey: "",
  extra: {},
};

export const ARENAS = [
  { id: "world-knowledge", title: "World Knowledge", players: "1,240", badgeText: "HOT QUIZ", badgeIcon: "fire", order: 0, active: true },
  { id: "global-currencies", title: "Global Currencies", players: "842", badgeText: "RAPID QUIZ", badgeIcon: "lightning-bolt", order: 1, active: true },
  { id: "science-logic", title: "Science & Logic", players: "2,105", badgeText: "LIVE", badgeIcon: "circle-medium", order: 2, active: true },
];
