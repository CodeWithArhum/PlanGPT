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
        background: "#0A0A0A",
        surface: "#111111",
        surfaceSecondary: "#1a1a1a",
        borderColor: "#2a2a2a",
        primary: "#bed754",
        textMain: "#f0f0f0",
        textMuted: "#888888",
        calPrayer: "#bed754",
        calClass: "#8ab4f8",
        calGrowth: "#c084fc",
        calOutreach: "#22d3ee",
        calWork: "#f4b977",
        calBreak: "#aaaaaa",
      },
      fontFamily: {
        mono: ['SF Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
