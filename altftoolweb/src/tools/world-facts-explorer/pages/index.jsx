"use client";

import { useState, useMemo } from "react";
import { Sparkles, Info, Copy, Download, CheckCircle2, Search, ArrowUpDown, Globe, Users, Map, TrendingUp } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const COUNTRIES = [
  { country: "China", continent: "Asia", population: 1412000000, area: 9596961, gdp: 17963, hdi: 0.768, capital: "Beijing", flag: "🇨🇳" },
  { country: "India", continent: "Asia", population: 1408000000, area: 3287263, gdp: 3535, hdi: 0.633, capital: "New Delhi", flag: "🇮🇳" },
  { country: "United States", continent: "N. America", population: 331900000, area: 9833520, gdp: 25462, hdi: 0.921, capital: "Washington D.C.", flag: "🇺🇸" },
  { country: "Indonesia", continent: "Asia", population: 275500000, area: 1904569, gdp: 1319, hdi: 0.705, capital: "Jakarta", flag: "🇮🇩" },
  { country: "Pakistan", continent: "Asia", population: 220900000, area: 881913, gdp: 376, hdi: 0.544, capital: "Islamabad", flag: "🇵🇰" },
  { country: "Brazil", continent: "S. America", population: 214300000, area: 8515767, gdp: 1920, hdi: 0.754, capital: "Brasilia", flag: "🇧🇷" },
  { country: "Nigeria", continent: "Africa", population: 211400000, area: 923768, gdp: 477, hdi: 0.535, capital: "Abuja", flag: "🇳🇬" },
  { country: "Bangladesh", continent: "Asia", population: 169400000, area: 147570, gdp: 460, hdi: 0.661, capital: "Dhaka", flag: "🇧🇩" },
  { country: "Russia", continent: "Europe", population: 144100000, area: 17098242, gdp: 2240, hdi: 0.822, capital: "Moscow", flag: "🇷🇺" },
  { country: "Mexico", continent: "N. America", population: 128900000, area: 1964375, gdp: 1322, hdi: 0.758, capital: "Mexico City", flag: "🇲🇽" },
  { country: "Japan", continent: "Asia", population: 125700000, area: 377975, gdp: 4231, hdi: 0.925, capital: "Tokyo", flag: "🇯🇵" },
  { country: "Ethiopia", continent: "Africa", population: 120300000, area: 1104300, gdp: 126, hdi: 0.498, capital: "Addis Ababa", flag: "🇪🇹" },
  { country: "Philippines", continent: "Asia", population: 113900000, area: 300000, gdp: 404, hdi: 0.699, capital: "Manila", flag: "🇵🇭" },
  { country: "Egypt", continent: "Africa", population: 104300000, area: 1002450, gdp: 476, hdi: 0.731, capital: "Cairo", flag: "🇪🇬" },
  { country: "Germany", continent: "Europe", population: 83200000, area: 357022, gdp: 4072, hdi: 0.942, capital: "Berlin", flag: "🇩🇪" },
  { country: "United Kingdom", continent: "Europe", population: 67300000, area: 242495, gdp: 3070, hdi: 0.929, capital: "London", flag: "🇬🇧" },
  { country: "France", continent: "Europe", population: 67800000, area: 640679, gdp: 2782, hdi: 0.903, capital: "Paris", flag: "🇫🇷" },
  { country: "Italy", continent: "Europe", population: 59600000, area: 301340, gdp: 2010, hdi: 0.895, capital: "Rome", flag: "🇮🇹" },
  { country: "South Africa", continent: "Africa", population: 59300000, area: 1221037, gdp: 405, hdi: 0.713, capital: "Pretoria", flag: "🇿🇦" },
  { country: "Tanzania", continent: "Africa", population: 63600000, area: 945087, gdp: 75, hdi: 0.549, capital: "Dodoma", flag: "🇹🇿" },
  { country: "Myanmar", continent: "Asia", population: 54400000, area: 676578, gdp: 65, hdi: 0.585, capital: "Naypyidaw", flag: "🇲🇲" },
  { country: "Kenya", continent: "Africa", population: 54000000, area: 580367, gdp: 113, hdi: 0.575, capital: "Nairobi", flag: "🇰🇪" },
  { country: "South Korea", continent: "Asia", population: 51700000, area: 100210, gdp: 1665, hdi: 0.925, capital: "Seoul", flag: "🇰🇷" },
  { country: "Colombia", continent: "S. America", population: 51900000, area: 1141748, gdp: 343, hdi: 0.752, capital: "Bogota", flag: "🇨🇴" },
  { country: "Spain", continent: "Europe", population: 47400000, area: 505992, gdp: 1398, hdi: 0.905, capital: "Madrid", flag: "🇪🇸" },
  { country: "Uganda", continent: "Africa", population: 47200000, area: 241038, gdp: 45, hdi: 0.525, capital: "Kampala", flag: "🇺🇬" },
  { country: "Argentina", continent: "S. America", population: 46300000, area: 2780400, gdp: 632, hdi: 0.842, capital: "Buenos Aires", flag: "🇦🇷" },
  { country: "Algeria", continent: "Africa", population: 45000000, area: 2381741, gdp: 187, hdi: 0.745, capital: "Algiers", flag: "🇩🇿" },
  { country: "Sudan", continent: "Africa", population: 44900000, area: 1886068, gdp: 34, hdi: 0.508, capital: "Khartoum", flag: "🇸🇩" },
  { country: "Ukraine", continent: "Europe", population: 43800000, area: 603500, gdp: 161, hdi: 0.773, capital: "Kyiv", flag: "🇺🇦" },
  { country: "Iraq", continent: "Asia", population: 43500000, area: 438317, gdp: 264, hdi: 0.686, capital: "Baghdad", flag: "🇮🇶" },
  { country: "Afghanistan", continent: "Asia", population: 40100000, area: 652230, gdp: 14, hdi: 0.478, capital: "Kabul", flag: "🇦🇫" },
  { country: "Poland", continent: "Europe", population: 37700000, area: 312696, gdp: 688, hdi: 0.876, capital: "Warsaw", flag: "🇵🇱" },
  { country: "Canada", continent: "N. America", population: 38900000, area: 9984670, gdp: 2139, hdi: 0.936, capital: "Ottawa", flag: "🇨🇦" },
  { country: "Morocco", continent: "Africa", population: 37300000, area: 446550, gdp: 134, hdi: 0.683, capital: "Rabat", flag: "🇲🇦" },
  { country: "Saudi Arabia", continent: "Asia", population: 35900000, area: 2149690, gdp: 1108, hdi: 0.875, capital: "Riyadh", flag: "🇸🇦" },
  { country: "Peru", continent: "S. America", population: 33400000, area: 1285216, gdp: 242, hdi: 0.762, capital: "Lima", flag: "🇵🇪" },
  { country: "Angola", continent: "Africa", population: 34500000, area: 1246700, gdp: 107, hdi: 0.586, capital: "Luanda", flag: "🇦🇴" },
  { country: "Uzbekistan", continent: "Asia", population: 35300000, area: 448978, gdp: 80, hdi: 0.727, capital: "Tashkent", flag: "🇺🇿" },
  { country: "Malaysia", continent: "Asia", population: 33600000, area: 330803, gdp: 407, hdi: 0.803, capital: "Kuala Lumpur", flag: "🇲🇾" },
  { country: "Mozambique", continent: "Africa", population: 32200000, area: 801590, gdp: 17, hdi: 0.446, capital: "Maputo", flag: "🇲🇿" },
  { country: "Ghana", continent: "Africa", population: 32800000, area: 238533, gdp: 72, hdi: 0.632, capital: "Accra", flag: "🇬🇭" },
  { country: "Yemen", continent: "Asia", population: 33700000, area: 527968, gdp: 22, hdi: 0.455, capital: "Sana'a", flag: "🇾🇪" },
  { country: "Nepal", continent: "Asia", population: 30000000, area: 147516, gdp: 40, hdi: 0.602, capital: "Kathmandu", flag: "🇳🇵" },
  { country: "Venezuela", continent: "S. America", population: 28400000, area: 916445, gdp: 96, hdi: 0.691, capital: "Caracas", flag: "🇻🇪" },
  { country: "Madagascar", continent: "Africa", population: 29600000, area: 587041, gdp: 14, hdi: 0.501, capital: "Antananarivo", flag: "🇲🇬" },
  { country: "Australia", continent: "Oceania", population: 26100000, area: 7692024, gdp: 1675, hdi: 0.951, capital: "Canberra", flag: "🇦🇺" },
  { country: "Cameroon", continent: "Africa", population: 27200000, area: 475442, gdp: 45, hdi: 0.576, capital: "Yaounde", flag: "🇨🇲" },
  { country: "North Korea", continent: "Asia", population: 25900000, area: 120538, gdp: 28, hdi: 0.733, capital: "Pyongyang", flag: "🇰🇵" },
  { country: "Taiwan", continent: "Asia", population: 23900000, area: 36193, gdp: 790, hdi: 0.916, capital: "Taipei", flag: "🇹🇼" },
  { country: "Sri Lanka", continent: "Asia", population: 22200000, area: 65610, gdp: 75, hdi: 0.782, capital: "Colombo", flag: "🇱🇰" },
  { country: "Mali", continent: "Africa", population: 21900000, area: 1240192, gdp: 19, hdi: 0.428, capital: "Bamako", flag: "🇲🇱" },
  { country: "Romania", continent: "Europe", population: 19300000, area: 238397, gdp: 301, hdi: 0.821, capital: "Bucharest", flag: "🇷🇴" },
  { country: "Kazakhstan", continent: "Asia", population: 19200000, area: 2724900, gdp: 220, hdi: 0.811, capital: "Astana", flag: "🇰🇿" },
  { country: "Guatemala", continent: "N. America", population: 17600000, area: 108889, gdp: 95, hdi: 0.627, capital: "Guatemala City", flag: "🇬🇹" },
  { country: "Ecuador", continent: "S. America", population: 18000000, area: 283561, gdp: 115, hdi: 0.740, capital: "Quito", flag: "🇪🇨" },
  { country: "Netherlands", continent: "Europe", population: 17500000, area: 41543, gdp: 1009, hdi: 0.941, capital: "Amsterdam", flag: "🇳🇱" },
  { country: "Cambodia", continent: "Asia", population: 16900000, area: 181035, gdp: 30, hdi: 0.593, capital: "Phnom Penh", flag: "🇰🇭" },
  { country: "Senegal", continent: "Africa", population: 17200000, area: 196722, gdp: 28, hdi: 0.511, capital: "Dakar", flag: "🇸🇳" },
  { country: "Chad", continent: "Africa", population: 17400000, area: 1284000, gdp: 12, hdi: 0.394, capital: "N'Djamena", flag: "🇹🇩" },
  { country: "Somalia", continent: "Africa", population: 17100000, area: 637657, gdp: 8, hdi: 0.361, capital: "Mogadishu", flag: "🇸🇴" },
  { country: "Zimbabwe", continent: "Africa", population: 15900000, area: 390757, gdp: 28, hdi: 0.550, capital: "Harare", flag: "🇿🇼" },
  { country: "Guinea", continent: "Africa", population: 13500000, area: 245857, gdp: 16, hdi: 0.465, capital: "Conakry", flag: "🇬🇳" },
  { country: "Rwanda", continent: "Africa", population: 13300000, area: 26338, gdp: 11, hdi: 0.534, capital: "Kigali", flag: "🇷🇼" },
  { country: "Benin", continent: "Africa", population: 13300000, area: 112622, gdp: 17, hdi: 0.525, capital: "Porto-Novo", flag: "🇧🇯" },
  { country: "Tunisia", continent: "Africa", population: 12000000, area: 163610, gdp: 46, hdi: 0.731, capital: "Tunis", flag: "🇹🇳" },
  { country: "Bolivia", continent: "S. America", population: 12100000, area: 1098581, gdp: 44, hdi: 0.692, capital: "Sucre", flag: "🇧🇴" },
  { country: "Belgium", continent: "Europe", population: 11600000, area: 30528, gdp: 578, hdi: 0.937, capital: "Brussels", flag: "🇧🇪" },
  { country: "Haiti", continent: "N. America", population: 11600000, area: 27750, gdp: 20, hdi: 0.535, capital: "Port-au-Prince", flag: "🇭🇹" },
  { country: "Cuba", continent: "N. America", population: 11300000, area: 109884, gdp: 107, hdi: 0.764, capital: "Havana", flag: "🇨🇺" },
  { country: "Jordan", continent: "Asia", population: 11100000, area: 89342, gdp: 48, hdi: 0.720, capital: "Amman", flag: "🇯🇴" },
  { country: "Czech Republic", continent: "Europe", population: 10800000, area: 78867, gdp: 291, hdi: 0.889, capital: "Prague", flag: "🇨🇿" },
  { country: "Sweden", continent: "Europe", population: 10500000, area: 450295, gdp: 585, hdi: 0.947, capital: "Stockholm", flag: "🇸🇪" },
  { country: "Greece", continent: "Europe", population: 10400000, area: 131957, gdp: 219, hdi: 0.887, capital: "Athens", flag: "🇬🇷" },
  { country: "Portugal", continent: "Europe", population: 10300000, area: 92212, gdp: 252, hdi: 0.866, capital: "Lisbon", flag: "🇵🇹" },
  { country: "Azerbaijan", continent: "Asia", population: 10100000, area: 86600, gdp: 78, hdi: 0.745, capital: "Baku", flag: "🇦🇿" },
  { country: "Hungary", continent: "Europe", population: 9700000, area: 93028, gdp: 184, hdi: 0.846, capital: "Budapest", flag: "🇭🇺" },
  { country: "Honduras", continent: "N. America", population: 10300000, area: 112492, gdp: 29, hdi: 0.621, capital: "Tegucigalpa", flag: "🇭🇳" },
  { country: "United Arab Emirates", continent: "Asia", population: 9900000, area: 83600, gdp: 507, hdi: 0.911, capital: "Abu Dhabi", flag: "🇦🇪" },
  { country: "Belarus", continent: "Europe", population: 9400000, area: 207600, gdp: 72, hdi: 0.808, capital: "Minsk", flag: "🇧🇾" },
  { country: "Tajikistan", continent: "Asia", population: 10000000, area: 143100, gdp: 11, hdi: 0.679, capital: "Dushanbe", flag: "🇹🇯" },
  { country: "Papua New Guinea", continent: "Oceania", population: 10000000, area: 462840, gdp: 30, hdi: 0.558, capital: "Port Moresby", flag: "🇵🇬" },
  { country: "Austria", continent: "Europe", population: 9100000, area: 83879, gdp: 471, hdi: 0.916, capital: "Vienna", flag: "🇦🇹" },
  { country: "Switzerland", continent: "Europe", population: 8700000, area: 41284, gdp: 807, hdi: 0.962, capital: "Bern", flag: "🇨🇭" },
  { country: "New Zealand", continent: "Oceania", population: 5100000, area: 268021, gdp: 249, hdi: 0.937, capital: "Wellington", flag: "🇳🇿" },
  { country: "Norway", continent: "Europe", population: 5400000, area: 385207, gdp: 579, hdi: 0.961, capital: "Oslo", flag: "🇳🇴" },
  { country: "Ireland", continent: "Europe", population: 5100000, area: 70273, gdp: 529, hdi: 0.945, capital: "Dublin", flag: "🇮🇪" },
  { country: "Costa Rica", continent: "N. America", population: 5200000, area: 51100, gdp: 68, hdi: 0.809, capital: "San Jose", flag: "🇨🇷" },
  { country: "Singapore", continent: "Asia", population: 5900000, area: 733, gdp: 424, hdi: 0.939, capital: "Singapore", flag: "🇸🇬" },
  { country: "Denmark", continent: "Europe", population: 5900000, area: 43094, gdp: 395, hdi: 0.948, capital: "Copenhagen", flag: "🇩🇰" },
  { country: "Finland", continent: "Europe", population: 5500000, area: 338424, gdp: 297, hdi: 0.940, capital: "Helsinki", flag: "🇫🇮" },
  { country: "Iceland", continent: "Europe", population: 380000, area: 103000, gdp: 27, hdi: 0.959, capital: "Reykjavik", flag: "🇮🇸" },
  { country: "Luxembourg", continent: "Europe", population: 650000, area: 2586, gdp: 85, hdi: 0.930, capital: "Luxembourg", flag: "🇱🇺" },
  { country: "Malta", continent: "Europe", population: 520000, area: 316, gdp: 17, hdi: 0.906, capital: "Valletta", flag: "🇲🇹" },
  { country: "Bahrain", continent: "Asia", population: 1500000, area: 778, gdp: 44, hdi: 0.888, capital: "Manama", flag: "🇧🇭" },
  { country: "Trinidad and Tobago", continent: "N. America", population: 1400000, area: 5130, gdp: 27, hdi: 0.810, capital: "Port of Spain", flag: "🇹🇹" },
  { country: "Estonia", continent: "Europe", population: 1300000, area: 45227, gdp: 38, hdi: 0.890, capital: "Tallinn", flag: "🇪🇪" },
  { country: "Mauritius", continent: "Africa", population: 1300000, area: 2040, gdp: 13, hdi: 0.802, capital: "Port Louis", flag: "🇲🇺" },
  { country: "Cyprus", continent: "Europe", population: 1200000, area: 9251, gdp: 28, hdi: 0.896, capital: "Nicosia", flag: "🇨🇾" },
  { country: "Djibouti", continent: "Africa", population: 1000000, area: 23200, gdp: 3, hdi: 0.509, capital: "Djibouti", flag: "🇩🇯" },
  { country: "Fiji", continent: "Oceania", population: 930000, area: 18274, gdp: 5, hdi: 0.730, capital: "Suva", flag: "🇫🇯" },
  { country: "Bhutan", continent: "Asia", population: 780000, area: 38394, gdp: 3, hdi: 0.666, capital: "Thimphu", flag: "🇧🇹" },
  { country: "Comoros", continent: "Africa", population: 870000, area: 2235, gdp: 1, hdi: 0.558, capital: "Moroni", flag: "🇰🇲" },
  { country: "Maldives", continent: "Asia", population: 540000, area: 298, gdp: 6, hdi: 0.747, capital: "Male", flag: "🇲🇻" },
  { country: "Suriname", continent: "S. America", population: 590000, area: 163820, gdp: 3, hdi: 0.730, capital: "Paramaribo", flag: "🇸🇷" },
  { country: "Brunei", continent: "Asia", population: 450000, area: 5765, gdp: 16, hdi: 0.829, capital: "Bandar Seri Begawan", flag: "🇧🇳" },
  { country: "Bahamas", continent: "N. America", population: 410000, area: 13943, gdp: 13, hdi: 0.812, capital: "Nassau", flag: "🇧🇸" },
  { country: "Barbados", continent: "N. America", population: 290000, area: 430, gdp: 6, hdi: 0.809, capital: "Bridgetown", flag: "🇧🇧" },
  { country: "Vanuatu", continent: "Oceania", population: 320000, area: 12189, gdp: 1, hdi: 0.607, capital: "Port Vila", flag: "🇻🇺" },
  { country: "Samoa", continent: "Oceania", population: 200000, area: 2842, gdp: 1, hdi: 0.707, capital: "Apia", flag: "🇼🇸" },
  { country: "Saint Lucia", continent: "N. America", population: 180000, area: 616, gdp: 2, hdi: 0.725, capital: "Castries", flag: "🇱🇨" },
  { country: "Seychelles", continent: "Africa", population: 100000, area: 455, gdp: 2, hdi: 0.785, capital: "Victoria", flag: "🇸🇨" },
  { country: "Andorra", continent: "Europe", population: 80000, area: 468, gdp: 3, hdi: 0.858, capital: "Andorra la Vella", flag: "🇦🇩" },
  { country: "Saint Kitts and Nevis", continent: "N. America", population: 54000, area: 261, gdp: 1, hdi: 0.777, capital: "Basseterre", flag: "🇰🇳" },
  { country: "Marshall Islands", continent: "Oceania", population: 42000, area: 181, gdp: 0.3, hdi: 0.704, capital: "Majuro", flag: "🇲🇭" },
  { country: "Liechtenstein", continent: "Europe", population: 39000, area: 160, gdp: 7, hdi: 0.935, capital: "Vaduz", flag: "🇱🇮" },
  { country: "San Marino", continent: "Europe", population: 34000, area: 61, gdp: 2, hdi: 0.853, capital: "San Marino", flag: "🇸🇲" },
  { country: "Palau", continent: "Oceania", population: 18000, area: 459, gdp: 0.3, hdi: 0.767, capital: "Ngerulmud", flag: "🇵🇼" },
  { country: "Nauru", continent: "Oceania", population: 11000, area: 21, gdp: 0.2, hdi: 0.740, capital: "Yaren", flag: "🇳🇷" },
  { country: "Tuvalu", continent: "Oceania", population: 11000, area: 26, gdp: 0.06, hdi: 0.641, capital: "Funafuti", flag: "🇹🇻" },
  { country: "Vatican City", continent: "Europe", population: 800, area: 0.44, gdp: 0.08, hdi: null, capital: "Vatican City", flag: "🇻🇦" },
];

const CATEGORIES = [
  { id: "population", label: "Population", unit: "", icon: Users, format: (v) => v >= 1e9 ? `${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : v.toString() },
  { id: "area", label: "Area", unit: "km²", icon: Map, format: (v) => v.toLocaleString() },
  { id: "gdp", label: "GDP (Billion $)", unit: "B$", icon: TrendingUp, format: (v) => `$${v}B` },
  { id: "hdi", label: "HDI", unit: "", icon: Sparkles, format: (v) => v ? v.toFixed(3) : "N/A" },
];

const CONTINENTS = [...new Set(COUNTRIES.map((c) => c.continent))].sort();

const SORT_ORDERS = {
  population: (a, b) => b.population - a.population,
  area: (a, b) => b.area - a.area,
  gdp: (a, b) => b.gdp - a.gdp,
  hdi: (a, b) => (b.hdi || 0) - (a.hdi || 0),
};

const SORT_LABELS = {
  population: "Most Populated",
  area: "Largest Area",
  gdp: "Highest GDP",
  hdi: "Highest HDI",
};

function getHdiCategory(hdi) {
  if (!hdi) return { label: "N/A", color: "text-[var(--muted)]" };
  if (hdi >= 0.8) return { label: "Very High", color: "text-emerald-600" };
  if (hdi >= 0.7) return { label: "High", color: "text-teal-600" };
  if (hdi >= 0.55) return { label: "Medium", color: "text-amber-600" };
  return { label: "Low", color: "text-red-600" };
}

export default function ToolHome() {
  const [sortBy, setSortBy] = useState("population");
  const [continentFilter, setContinentFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("table");

  const filtered = useMemo(() => {
    let data = [...COUNTRIES];
    if (continentFilter !== "all") data = data.filter((c) => c.continent === continentFilter);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((c) => c.country.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q));
    }
    data.sort(SORT_ORDERS[sortBy]);
    return data;
  }, [sortBy, continentFilter, search]);

  const toggleCompare = (country) => {
    setSelected((prev) => {
      if (prev.find((c) => c.country === country.country)) return prev.filter((c) => c.country !== country.country);
      if (prev.length >= 5) return prev;
      return [...prev, country];
    });
  };

  const buildReportText = () => {
    return `
WORLD FACTS EXPLORER REPORT
Sorted by: ${SORT_LABELS[sortBy]}
Filter: ${continentFilter === "all" ? "All Continents" : continentFilter}
Generated: ${new Date().toLocaleString()}
---------------------------------
TOP 20 BY ${sortBy.toUpperCase()}:
${filtered.slice(0, 20).map((c, i) => `${i + 1}. ${c.flag} ${c.country} — Pop: ${c.population.toLocaleString()}, Area: ${c.area.toLocaleString()} km², GDP: $${c.gdp}B, HDI: ${c.hdi || "N/A"}`).join("\n")}

${selected.length > 0 ? `\nCOMPARISON (${selected.length} countries):\n${selected.map((c) => `${c.flag} ${c.country}: Pop ${c.population.toLocaleString()}, Area ${c.area.toLocaleString()} km², GDP $${c.gdp}B, HDI ${c.hdi || "N/A"}`).join("\n")}` : ""}

---------------------------------
World Facts Explorer — Educational tool
    `.trim();
  };

  const copyReport = async () => {
    const success = await safeCopyText(buildReportText());
    if (success) { setCopied(true); setTimeout(() => setCopied(false), 1200); }
  };

  const downloadReport = () => {
    const blob = new Blob([buildReportText()], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `World_Facts_${sortBy}.txt`;
    link.click();
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Explore data for 100+ countries — population, area, GDP, and HDI. Click any row to compare up to 5 countries side by side.</p>
          </div>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold uppercase text-pink-700">
            <Sparkles className="h-4 w-4" />
            Interactive world data
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">World Facts Explorer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Explore population, area, GDP, and HDI data for 100+ countries. Sort, filter, search, and compare countries side by side.
          </p>
        </section>

        {/* Controls */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search countries or capitals..." className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]">
              {CATEGORIES.map((cat) => <option key={cat.id} value={cat.id}>Sort: {cat.label}</option>)}
            </select>
            <select value={continentFilter} onChange={(e) => setContinentFilter(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]">
              <option value="all">All Continents</option>
              {CONTINENTS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => setCompareMode(!compareMode)} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${compareMode ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)]"}`}>
              {compareMode ? `Compare (${selected.length}/5)` : "Compare Mode"}
            </button>
            <button onClick={copyReport} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--muted)]">
              {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Export"}
            </button>
          </div>
        </section>

        {/* Comparison */}
        {selected.length > 0 && (
          <section className="rounded-lg border border-[var(--primary)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Comparison ({selected.length}/5)</h2>
              <button onClick={() => setSelected([])} className="text-xs font-semibold text-red-600 hover:underline">Clear All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="py-2 text-left font-bold text-[var(--foreground)]">Country</th>
                    {CATEGORIES.map((cat) => (
                      <th key={cat.id} className="py-2 text-right font-bold text-[var(--foreground)]">{cat.label}</th>
                    ))}
                    <th className="py-2 text-right font-bold text-[var(--foreground)]">HDI Level</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.map((c) => (
                    <tr key={c.country} className="border-b border-[var(--border)]/50">
                      <td className="py-2 font-semibold text-[var(--foreground)]">{c.flag} {c.country}</td>
                      {CATEGORIES.map((cat) => (
                        <td key={cat.id} className="py-2 text-right tabular-nums text-[var(--foreground)]">{cat.format(c[cat.id])}</td>
                      ))}
                      <td className="py-2 text-right"><span className={`font-semibold ${getHdiCategory(c.hdi).color}`}>{getHdiCategory(c.hdi).label}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Data Table */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)]/30">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-[var(--foreground)]">#</th>
                  <th className="px-4 py-3 text-left font-bold text-[var(--foreground)]">Country</th>
                  <th className="px-4 py-3 text-left font-bold text-[var(--foreground)]">Capital</th>
                  <th className="px-4 py-3 text-left font-bold text-[var(--foreground)]">Continent</th>
                  <th className="px-4 py-3 text-right font-bold text-[var(--foreground)]">Population</th>
                  <th className="px-4 py-3 text-right font-bold text-[var(--foreground)]">Area (km²)</th>
                  <th className="px-4 py-3 text-right font-bold text-[var(--foreground)]">GDP ($B)</th>
                  <th className="px-4 py-3 text-right font-bold text-[var(--foreground)]">HDI</th>
                  <th className="px-4 py-3 text-right font-bold text-[var(--foreground)]">HDI Level</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((c, i) => {
                  const isSelected = selected.find((s) => s.country === c.country);
                  return (
                    <tr key={`${c.country}-${i}`} onClick={() => compareMode && toggleCompare(c)} className={`border-t border-[var(--border)]/50 transition-all ${compareMode ? "cursor-pointer hover:bg-[var(--primary)]/5" : "hover:bg-[var(--muted)]/20"} ${isSelected ? "bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30" : ""}`}>
                      <td className="px-4 py-2.5 text-[var(--muted)]">{i + 1}</td>
                      <td className="px-4 py-2.5 font-semibold text-[var(--foreground)]">{c.flag} {c.country}</td>
                      <td className="px-4 py-2.5 text-[var(--foreground)]">{c.capital}</td>
                      <td className="px-4 py-2.5 text-[var(--foreground)]">{c.continent}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[var(--foreground)]">{c.population.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[var(--foreground)]">{c.area.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[var(--foreground)]">${c.gdp}B</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[var(--foreground)]">{c.hdi ? c.hdi.toFixed(3) : "N/A"}</td>
                      <td className="px-4 py-2.5 text-right"><span className={`font-semibold ${getHdiCategory(c.hdi).color}`}>{getHdiCategory(c.hdi).label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > 50 && (
            <div className="border-t border-[var(--border)] p-3 text-center text-sm text-[var(--muted)]">
              Showing 50 of {filtered.length} countries. Use search to narrow results.
            </div>
          )}
        </section>

        {/* Insights */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Quick Insights</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-bold uppercase text-[var(--muted)]">Most Populated</p>
              <p className="text-lg font-black text-[var(--foreground)] mt-1">{COUNTRIES.sort((a, b) => b.population - a.population)[0].flag} {COUNTRIES.sort((a, b) => b.population - a.population)[0].country}</p>
              <p className="text-xs text-[var(--muted)]">{(COUNTRIES.sort((a, b) => b.population - a.population)[0].population / 1e9).toFixed(2)} billion</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-bold uppercase text-[var(--muted)]">Largest by Area</p>
              <p className="text-lg font-black text-[var(--foreground)] mt-1">{COUNTRIES.sort((a, b) => b.area - a.area)[0].flag} {COUNTRIES.sort((a, b) => b.area - a.area)[0].country}</p>
              <p className="text-xs text-[var(--muted)]">{COUNTRIES.sort((a, b) => b.area - a.area)[0].area.toLocaleString()} km²</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-bold uppercase text-[var(--muted)]">Highest GDP</p>
              <p className="text-lg font-black text-[var(--foreground)] mt-1">{COUNTRIES.sort((a, b) => b.gdp - a.gdp)[0].flag} {COUNTRIES.sort((a, b) => b.gdp - a.gdp)[0].country}</p>
              <p className="text-xs text-[var(--muted)]">${COUNTRIES.sort((a, b) => b.gdp - a.gdp)[0].gdp}B</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-bold uppercase text-[var(--muted)]">Highest HDI</p>
              <p className="text-lg font-black text-[var(--foreground)] mt-1">{COUNTRIES.filter((c) => c.hdi).sort((a, b) => b.hdi - a.hdi)[0].flag} {COUNTRIES.filter((c) => c.hdi).sort((a, b) => b.hdi - a.hdi)[0].country}</p>
              <p className="text-xs text-[var(--muted)]">{COUNTRIES.filter((c) => c.hdi).sort((a, b) => b.hdi - a.hdi)[0].hdi.toFixed(3)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Understanding the Data</h3>
          <div className="grid gap-6 sm:grid-cols-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">Human Development Index (HDI)</p>
              <p>HDI is a composite statistic of life expectancy, education, and per capita income. Values range from 0 to 1. Very High: ≥0.8, High: 0.7–0.799, Medium: 0.55–0.699, Low: &lt;0.55. Norway (0.961) and Switzerland (0.962) consistently rank highest.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-2">GDP and Economy</p>
              <p>GDP (Gross Domestic Product) measures total economic output. GDP per capita gives a better picture of individual prosperity. The US ($25.5T) and China ($18T) are the two largest economies, together accounting for ~40% of global GDP.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
