export const categories = [
  "Home & Lifestyle",
  "Health & Wellness",
  "Food & Kitchen",
  "Finance",
  "Technology",
  "Services"
];

export const categoryMap = {
  "Home & Lifestyle": ["Mattresses","Gaming Chairs","Air Purifiers",,"Pillows", "Bidets","Weighted Blankets","Mattress Toppers"],
  "Food & Kitchen":["Pizza Oven"],
  "Technology": ["VPN", "Password Managers"],
  "Health & Wellness": ["Diet Plans","Invisible Braces","Hair Loss"],
  "Services": ["Home Warranty","Dog Food Delivery","Mobile Phone Plans","Meal Delivery", "Internet Providers"],
  "Finance": ["Home Warranty", "Pet Insurance", "Student Loan","Pet Insurance"]
};


export const categoriesConfig = categories.map((cat) => ({
  category: cat,
  subCategories: categoryMap[cat] || []
}));