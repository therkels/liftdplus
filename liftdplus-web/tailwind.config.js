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
        foreground: "var(--foreground)",
        accentLight: "var(--accent-light)",
        accent: {
          DEFAULT: "var(--accent)",
          dark: "var(--accent-dark)",
        },
        onboarding: {
          header: "var(--onboarding-header)",
        },
      },
    },
  },
  plugins: [],
};
