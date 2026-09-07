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
          bg:          "var(--nb-bg)",
          surface:     "var(--nb-surface)",
          "surface-2": "var(--nb-surface-2)",
          border:      "var(--nb-border)",
          stroke:      "var(--nb-stroke)",
          yellow:      "var(--nb-yellow)",
          green:       "var(--nb-green)",
          red:         "var(--nb-red)",
          blue:        "var(--nb-blue)",
          white:       "var(--nb-white)",
          muted:       "var(--nb-muted)",
          bevel:       "var(--nb-bevel)",
          recessed:    "var(--nb-recessed)",
        },
      },
      fontFamily: {
        sans:    ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "ui-monospace", "Menlo", "monospace"],
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Tactile Skeuomorphic Elevation & Light Reflection Presets
        "skeuo-card": "inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.4), 0 10px 25px -5px rgba(0, 0, 0, 0.45), 0 4px 10px rgba(0, 0, 0, 0.25)",
        "skeuo-card-lg": "inset 0 1px 0 rgba(255, 255, 255, 0.16), inset 0 -1px 0 rgba(0, 0, 0, 0.5), 0 18px 38px -8px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.35)",
        "skeuo-card-hover": "inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 -1px 0 rgba(0, 0, 0, 0.5), 0 16px 32px -6px rgba(0, 0, 0, 0.55), 0 6px 14px rgba(0, 0, 0, 0.35)",
        "skeuo-button": "inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 0 rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)",
        "skeuo-button-hover": "inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -2px 0 rgba(0, 0, 0, 0.35), 0 6px 14px rgba(0, 0, 0, 0.35)",
        "skeuo-button-pressed": "inset 0 2px 5px rgba(0, 0, 0, 0.45), inset 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.15)",
        "skeuo-inset": "inset 0 2px 4px rgba(0, 0, 0, 0.45), inset 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.06)",
        "skeuo-inset-deep": "inset 0 3px 6px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.08)",
        "skeuo-badge": "inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.2)",
        "skeuo-gold": "inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 rgba(0, 0, 0, 0.25), 0 4px 14px rgba(245, 158, 11, 0.35)",
        "skeuo-blue": "inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 0 rgba(0, 0, 0, 0.3), 0 4px 14px rgba(37, 99, 235, 0.35)",
        "skeuo-green": "inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 0 rgba(0, 0, 0, 0.3), 0 4px 14px rgba(16, 185, 129, 0.35)",
        "skeuo-red": "inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 0 rgba(0, 0, 0, 0.3), 0 4px 14px rgba(239, 68, 68, 0.35)",
        // Backwards compatibility mappings for existing brutal shadow names
        brutal:      "inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.3)",
        "brutal-sm": "inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 2px 5px rgba(0, 0, 0, 0.25)",
        "brutal-lg": "inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 0 rgba(0, 0, 0, 0.35), 0 8px 18px rgba(0, 0, 0, 0.4)",
        "brutal-xl": "inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 rgba(0, 0, 0, 0.4), 0 14px 28px rgba(0, 0, 0, 0.45)",
        "brutal-y":  "inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 rgba(0, 0, 0, 0.25), 0 4px 14px rgba(245, 158, 11, 0.35)",
        "brutal-y-lg":"inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -2px 0 rgba(0, 0, 0, 0.3), 0 8px 20px rgba(245, 158, 11, 0.4)",
        "brutal-g":  "inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 0 rgba(0, 0, 0, 0.3), 0 4px 14px rgba(16, 185, 129, 0.35)",
        "brutal-b":  "inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 0 rgba(0, 0, 0, 0.3), 0 4px 14px rgba(37, 99, 235, 0.35)",
        "brutal-r":  "inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 0 rgba(0, 0, 0, 0.3), 0 4px 14px rgba(239, 68, 68, 0.35)",
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
        "pulse-glow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":       { opacity: "0.75", transform: "scale(0.97)" },
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
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "slide-in": "slide-in 0.2s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
