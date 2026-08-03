/** @type {import('tailwindcss').Config} */
// Brand: مدرسة العنقاء (Al-Anqa / "Phoenix" School)
// Colors sampled from the school's phoenix logo — indigo-navy body, warm gold wings.
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — dark blue, used for headers, nav, primary buttons, footer
        navy: {
          50: "#eeedf7",
          100: "#d3d0ea",
          300: "#8d84bb",
          500: "#4f4590",
          700: "#3b3480", // primary brand color — matches logo's phoenix body
          900: "#221d4d",
        },
        // Light blue — secondary surfaces, hover states, section backgrounds
        sky: {
          50: "#f0f6fc",
          100: "#dcebf8",
          300: "#a9cdec",
          500: "#5b9bd5",
          700: "#3572a5",
        },
        // Gold — accents only: badges, important-status, active nav indicator
        gold: {
          50: "#fdf6e6",
          100: "#faeac0",
          300: "#f2ca6e",
          500: "#e8ab35", // primary gold — matches logo's wing color
          700: "#a97b1c",
        },
        // Status colors — used sparingly (important homework badge, form errors)
        status: {
          important: "#b3541e",
          success: "#2f7d4f",
          error: "#c23b3b",
        },
      },
      fontFamily: {
        // Tajawal: clean, professional Arabic typeface with a full weight range,
        // reads as modern/institutional rather than decorative — right fit for
        // a private school (vs. a rounded/playful Arabic font).
        sans: ["var(--font-tajawal)", "Tahoma", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        control: "10px",
      },
      boxShadow: {
        card: "0 2px 10px -2px rgba(10, 27, 48, 0.08), 0 1px 3px -1px rgba(10, 27, 48, 0.06)",
        "card-hover": "0 8px 24px -4px rgba(10, 27, 48, 0.12), 0 2px 6px -2px rgba(10, 27, 48, 0.08)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.7s ease-out both",
      },
    },
  },
  plugins: [],
};
