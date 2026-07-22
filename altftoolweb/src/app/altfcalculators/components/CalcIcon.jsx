"use client";

// Maps the string `icon` names in toolsData.js to lucide-react icons, so
// toolsData stays a plain (JSX-free) data module. Unknown names fall back to a
// calculator icon, so a typo degrades gracefully instead of crashing.

import {
  Landmark, Home, Wallet, Car, Building2, CalendarCheck, Banknote, TrendingUp,
  Coins, PiggyBank, CalendarPlus, LineChart, Percent, Target, ReceiptText,
  Receipt, HandCoins, BadgePercent, ArrowLeftRight, PieChart, ShoppingCart,
  Scale, Utensils, Activity, Gauge, Ruler, Egg, Flame, HeartPulse,
  FunctionSquare, Calculator, Divide, Sigma, Square, Box, Circle, Triangle,
  Layers, Superscript, Radical, Hash, Grid2x2, ArrowUpDown, BarChart3, Cake,
  CalendarDays, Clock, Hourglass, CalendarClock, GraduationCap, BookOpenCheck,
  School, ClipboardList, Repeat, Weight, Thermometer, HardDrive, Braces,
  FileJson, KeyRound, Binary, Link, Fingerprint, KeySquare, QrCode, Regex,
  Blocks, LayoutGrid, Cpu, Zap, Lightbulb, BatteryCharging, Fuel, Sun, Wind,
  Heart, Dices, Coffee,
} from "lucide-react";

const ICONS = {
  Landmark, Home, Wallet, Car, Building2, CalendarCheck, Banknote, TrendingUp,
  Coins, PiggyBank, CalendarPlus, LineChart, Percent, Target, ReceiptText,
  Receipt, HandCoins, BadgePercent, ArrowLeftRight, PieChart, ShoppingCart,
  Scale, Utensils, Activity, Gauge, Ruler, Egg, Flame, HeartPulse,
  FunctionSquare, Calculator, Divide, Sigma, Square, Box, Circle, Triangle,
  Layers, Superscript, Radical, Hash, Grid2x2, ArrowUpDown, BarChart3, Cake,
  CalendarDays, Clock, Hourglass, CalendarClock, GraduationCap, BookOpenCheck,
  School, ClipboardList, Repeat, Weight, Thermometer, HardDrive, Braces,
  FileJson, KeyRound, Binary, Link, Fingerprint, KeySquare, QrCode, Regex,
  Blocks, LayoutGrid, Cpu, Zap, Lightbulb, BatteryCharging, Fuel, Sun, Wind,
  Heart, Dices, Coffee,
};

export default function CalcIcon({ name, size = 20, ...rest }) {
  const Icon = ICONS[name] || Calculator;
  return <Icon size={size} {...rest} />;
}
