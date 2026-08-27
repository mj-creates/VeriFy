/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: "#FDFBF7", // Off-white/Beige
          black: "#111111", // Deep ink black
          blue: "#4D96FF", // Vibrant retro blue
          pink: "#FF6B6B", // Punchy pink
          yellow: "#FFD93D", // Comic yellow
          green: "#6BCB77", // Retro green
          purple: "#9D4EDD",
          orange: "#F4845F"
        }
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px rgba(17,17,17,1)',
        'neo-lg': '8px 8px 0px 0px rgba(17,17,17,1)',
        'neo-xl': '12px 12px 0px 0px rgba(17,17,17,1)',
        'neo-active': '0px 0px 0px 0px rgba(17,17,17,1)',
      },
      fontFamily: {
        'space': ['"Space Mono"', 'monospace'],
        'display': ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
