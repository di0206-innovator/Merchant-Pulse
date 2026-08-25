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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        retro: {
          bg: "#8BE8F5",
          cyan: "#8BE8F5",
          teal: "#7CE0EE",
          cream: "#FAF7F2",
          yellow: "#FCD34D",
          pink: "#FF8AB5",
          coral: "#FF6B6B",
          dark: "#0F172A",
        },
        fintech: {
          navy: "#0A1128",
          charcoal: "#0F172A",
          surface: "#1E293B",
          border: "#334155",
          razorpay: "#3395FF",
          razorpayDark: "#0B2545",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          highlight: "#6366F1",
        }
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        retro: "4px 4px 0px 0px #0F172A",
        "retro-lg": "6px 6px 0px 0px #0F172A",
        "retro-sm": "2px 2px 0px 0px #0F172A",
      }
    },
  },
  plugins: [],
};

export default config;
