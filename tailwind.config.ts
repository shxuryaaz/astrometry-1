import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./ui/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "var(--font-sans)", "sans-serif"],
        body: ["'Inter'", "var(--font-sans)", "sans-serif"],
      },
      colors: {
        midnight: "#070410",
        cosmic: "#110b1c",
        aurora: "#f6c87a",
        astral: "#9a7bff",
        nebula: "#222034",
        stardust: "#383455",
        pearl: "#f8f5ff",
      },
      boxShadow: {
        glow: "0 15px 55px rgba(108, 82, 255, 0.25)",
        card: "0 12px 30px rgba(9, 5, 20, 0.45)",
      },
      backgroundImage: {
        "cosmic-gradient":
          "radial-gradient(circle at 20% 20%, rgba(247,206,136,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(153,118,255,0.35), transparent 55%), linear-gradient(135deg, #080512, #0d0720 55%, #080512)",
      },
    },
  },
  plugins: [],
};

export default config;

