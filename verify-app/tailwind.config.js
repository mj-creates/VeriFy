/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agent: {
          vera: "#4D96FF",   // Bright Blue
          vox: "#FF6B6B",    // Bright Red
          trace: "#6BCB77",  // Bright Green
          nova: "#9D4EDD",   // Bright Purple
          sol: "#FFD93D",    // Bright Yellow
          quinn: "#FF9F43"   // Bright Orange
        },
        cartoon: {
          bg: "#F4F4F4",
          border: "#000000"
        }
      },
      boxShadow: {
        'cartoon': '6px 6px 0px 0px rgba(0,0,0,1)',
        'cartoon-lg': '10px 10px 0px 0px rgba(0,0,0,1)',
        'cartoon-sm': '4px 4px 0px 0px rgba(0,0,0,1)',
      }
    },
  },
  plugins: [],
}
