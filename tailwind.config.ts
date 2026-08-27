import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./core/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        nb: {
          bg:      "var(--nb-bg)",
          surface: "var(--nb-surface)",
          border:  "var(--nb-border)",
          stroke:  "var(--nb-stroke)",
          yellow:  "var(--nb-yellow)",
          green:   "var(--nb-green)",
          red:     "var(--nb-red)",
          blue:    "var(--nb-blue)",
          white:   "var(--nb-white)",
          muted:   "var(--nb-muted)",
        },
      },
      fontFamily: {
        sans:    ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "ui-monospace", "Menlo", "monospace"],
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brutal:      "3px 3px 0px 0px #FFFFFF",
        "brutal-sm": "2px 2px 0px 0px #FFFFFF",
        "brutal-lg": "6px 6px 0px 0px #FFFFFF",
        "brutal-xl": "8px 8px 0px 0px #FFFFFF",
        "brutal-y":  "3px 3px 0px 0px #FFE500",
        "brutal-y-lg":"6px 6px 0px 0px #FFE500",
        "brutal-g":  "3px 3px 0px 0px #00FF94",
        "brutal-b":  "3px 3px 0px 0px #3B82F6",
        "brutal-r":  "3px 3px 0px 0px #FF3B3B",
        none:        "none",
      },
      borderWidth: {
        "3": "3px",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },
      spacing: {
        "18": "4.5rem",
      },
      keyframes: {
        "flicker": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.85" },
        },
        "slide-in": {
          "0%":   { transform: "translateX(-8px)", opacity: "0" },
          "100%": { transform: "translateX(0)",    opacity: "1" },
        },
        "slide-up": {
          "0%":   { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
      },
      animation: {
        flicker:  "flicker 2s ease-in-out infinite",
        "slide-in": "slide-in 0.2s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
