export const TRACKING_METRICS = [
  { id: "focus", label: "Focus Score", icon: "Target", color: "text-teal-600" },
  { id: "memory", label: "Memory Score", icon: "Brain", color: "text-purple-600" },
  { id: "reaction", label: "Reaction Score", icon: "Zap", color: "text-amber-600" },
  { id: "attention", label: "Attention Score", icon: "Eye", color: "text-blue-600" },
  { id: "problemSolving", label: "Problem Solving", icon: "Puzzle", color: "text-rose-600" },
  { id: "learning", label: "Learning Score", icon: "GraduationCap", color: "text-indigo-600" },
  { id: "productivity", label: "Productivity", icon: "TrendingUp", color: "text-emerald-600" },
  { id: "consistency", label: "Consistency", icon: "Repeat", color: "text-cyan-600" },
];

export const DAILY_METRICS = [
  { id: "sleepHours", label: "Sleep Hours", min: 0, max: 14, step: 0.5, unit: "hrs", icon: "Moon" },
  { id: "waterIntake", label: "Water Intake", min: 0, max: 20, step: 1, unit: "glasses", icon: "Droplets" },
  { id: "mood", label: "Mood", min: 1, max: 5, step: 1, unit: "", icon: "Smile", labels: ["Terrible", "Bad", "Okay", "Good", "Great"] },
  { id: "energyLevel", label: "Energy Level", min: 1, max: 5, step: 1, unit: "", icon: "Battery", labels: ["Exhausted", "Low", "Moderate", "High", "Peak"] },
  { id: "studyHours", label: "Study Hours", min: 0, max: 16, step: 0.5, unit: "hrs", icon: "BookOpen" },
  { id: "workHours", label: "Work Hours", min: 0, max: 16, step: 0.5, unit: "hrs", icon: "Briefcase" },
  { id: "exercise", label: "Exercise", min: 0, max: 180, step: 5, unit: "min", icon: "Dumbbell" },
  { id: "meditation", label: "Meditation", min: 0, max: 120, step: 5, unit: "min", icon: "Flower2" },
];

export const GOAL_TYPES = [
  { id: "daily", label: "Daily Goal", icon: "Calendar" },
  { id: "weekly", label: "Weekly Goal", icon: "CalendarDays" },
  { id: "monthly", label: "Monthly Goal", icon: "CalendarRange" },
];

export const PHASES = {
  DASHBOARD: "dashboard",
  CHECKIN: "checkin",
  HISTORY: "history",
  GOALS: "goals",
  INSIGHTS: "insights",
  SETTINGS: "settings",
};

export const STORAGE_KEY = "altft_cognitive_tracker";

export const BADGES = [
  { id: "first-checkin", label: "First Check-In", description: "Complete your first daily check-in", icon: "Star" },
  { id: "7-day-streak", label: "7-Day Streak", description: "Log check-ins for 7 consecutive days", icon: "Flame" },
  { id: "30-day-streak", label: "30-Day Streak", description: "Log check-ins for 30 consecutive days", icon: "Award" },
  { id: "high-focus", label: "High Focus", description: "Achieve a focus score of 90+", icon: "Target" },
  { id: "perfect-mood", label: "Perfect Mood", description: "Log a mood of 5 for 7 consecutive days", icon: "Smile" },
  { id: "early-bird", label: "Early Bird", description: "Log 7+ hours of sleep for 5 consecutive days", icon: "Sunrise" },
  { id: "centurion", label: "Centurion", description: "Complete 100 total check-ins", icon: "Trophy" },
  { id: "productivity-pro", label: "Productivity Pro", description: "Achieve a productivity score of 95+", icon: "TrendingUp" },
];
