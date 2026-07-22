export const MANGALIK_HOUSES = [0, 1, 3, 6, 7, 11];

export const HOUSE_NAMES = {
  0: "1st House (Self)",
  1: "2nd House (Wealth)",
  3: "4th House (Home)",
  6: "7th House (Marriage)",
  7: "8th House (Longevity)",
  11: "12th House (Expenses)",
};

export const HOUSE_SEVERITY = {
  0: "Very High",
  1: "High",
  3: "High",
  6: "Critical",
  7: "Very High",
  11: "Moderate",
};

export const RASHI_LIST = [
  { id: 0, name: "Mesha", english: "Aries", lord: "Mangal", element: "Fire" },
  { id: 1, name: "Vrishabha", english: "Taurus", lord: "Shukra", element: "Earth" },
  { id: 2, name: "Mithuna", english: "Gemini", lord: "Budha", element: "Air" },
  { id: 3, name: "Karka", english: "Cancer", lord: "Chandra", element: "Water" },
  { id: 4, name: "Simha", english: "Leo", lord: "Surya", element: "Fire" },
  { id: 5, name: "Kanya", english: "Virgo", lord: "Budha", element: "Earth" },
  { id: 6, name: "Tula", english: "Libra", lord: "Shukra", element: "Air" },
  { id: 7, name: "Vrishchika", english: "Scorpio", lord: "Mangal", element: "Water" },
  { id: 8, name: "Dhanu", english: "Sagittarius", lord: "Guru", element: "Fire" },
  { id: 9, name: "Makara", english: "Capricorn", lord: "Shani", element: "Earth" },
  { id: 10, name: "Kumbha", english: "Aquarius", lord: "Shani", element: "Air" },
  { id: 11, name: "Meena", english: "Pisces", lord: "Guru", element: "Water" },
];

export const REMEDIES = [
  { title: "Manglik-Manglik Marriage", desc: "If both partners have Manglik Dosha, the doshas cancel each other — the most effective remedy." },
  { title: "Kumbh Vivah", desc: "Marry a banana tree or a pot (kumbh) before marriage to the actual partner, transferring the dosha." },
  { title: "Manglik Shanti Puja", desc: "Perform a Mangal Shanti havan with a qualified priest to pacify Mars's negative effects." },
  { title: "Tuesday Fasting", desc: "Fast on Tuesdays (Mangalvar) — eat only fruits and milk — to appease Mars." },
  { title: "Mars Mantra", desc: "Chant 'Om Mangalaya Namah' 108 times daily, especially on Tuesdays." },
  { title: "Red Donations", desc: "Donate red items (red lentils, red cloth, vermillion) and copper on Tuesdays." },
  { title: "Lord Hanuman Worship", desc: "Visit a Hanuman temple on Tuesdays and recite the Hanuman Chalisa." },
];

export const SEVERITY_COLORS = {
  "Critical": { bg: "bg-red-600/10", text: "text-red-600", dot: "bg-red-600" },
  "Very High": { bg: "bg-orange-600/10", text: "text-orange-600", dot: "bg-orange-600" },
  "High": { bg: "bg-amber-600/10", text: "text-amber-600", dot: "bg-amber-600" },
  "Moderate": { bg: "bg-yellow-600/10", text: "text-yellow-600", dot: "bg-yellow-600" },
};
