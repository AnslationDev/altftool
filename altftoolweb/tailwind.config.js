/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",

        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",

        border: "var(--border)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        "card-border": "var(--card-border)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
