/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        backgroundLight: "var(--background-light)",
        subtext: "var(--subtext)",
        foreground: "var(--foreground)",
        accentLight: "var(--accent-light)",
        accent: {
          DEFAULT: "var(--accent)",
          dark: "var(--accent-dark)",
          light: "var(--accent-light)",
        },
        onboarding: {
          header: "var(--onboarding-header)",
        },
      },
    },
  },
  plugins: [],
};
