import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          DEFAULT: "#D97706",
          light: "#F59E0B",
          dim:   "rgba(180,83,9,0.08)",
          50:    "#FFFBEB",
          100:   "#FEF3C7",
          400:   "#F59E0B",
          500:   "#D97706",
          600:   "#B45309",
          700:   "#92400E",
          800:   "#78350F",
        },
        verde:  { DEFAULT: "#15803D", dim: "rgba(21,128,61,0.08)" },
        ambar:  { DEFAULT: "#B45309", dim: "rgba(180,83,9,0.08)" },
        rojo:   { DEFAULT: "#B91C1C", dim: "rgba(185,28,28,0.08)" },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem", letterSpacing: "0.05em" }],
      },
      borderRadius: {
        DEFAULT: "10px",
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
      },
      borderWidth: {
        DEFAULT: "1px",
        "2": "2px",
        "3": "3px",
      },
      spacing: {
        sidebar: "240px",
        topbar:  "56px",
        "18":    "4.5rem",
      },
      boxShadow: {
        sm:   "0 1px 2px rgba(0,0,0,0.05)",
        md:   "0 4px 16px rgba(0,0,0,0.06)",
        glow: "0 0 0 1px rgba(180,83,9,0.15), 0 0 20px rgba(180,83,9,0.05)",
        "glow-red": "0 0 0 1px rgba(185,28,28,0.15), 0 0 20px rgba(185,28,28,0.05)",
        "glow-green": "0 0 0 1px rgba(21,128,61,0.15), 0 0 20px rgba(21,128,61,0.05)",
      },
      transitionTimingFunction: {
        "expo":     "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-expo":  "cubic-bezier(0.7, 0, 0.84, 0)",
      },
      transitionDuration: {
        "150": "150ms",
        "220": "220ms",
        "300": "300ms",
        "800": "800ms",
      },
      animation: {
        "pulse-slow":  "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in-up":  "fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in":     "fade-in 0.2s ease both",
        "spin-slow":   "spin 3s linear infinite",
      },
      keyframes: {
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
