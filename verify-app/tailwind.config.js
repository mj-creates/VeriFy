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
          vera: "#7BDFF2",   // Baby Blue
          vox: "#FF9AA2",    // Coral Pink
          trace: "#B5EAD7",  // Mint Green
          nova: "#C7CEEA",   // Lilac
          sol: "#FFDAC1",    // Butter Yellow
          quinn: "#FFB7B2"   // Peach
        },
        candy: {
          bg1: "#FFEDFA", // Very light pink
          bg2: "#E6F4F1", // Very light mint
          text: "#5D4E6D", // Soft dark purple/grey for text
        }
      },
      boxShadow: {
        'bubbly': '0 8px 32px rgba(255, 182, 193, 0.4)',
        'bubbly-lg': '0 12px 48px rgba(255, 182, 193, 0.5)',
        'jelly-btn': '0 6px 0 rgba(209, 213, 219, 1)',
        'jelly-btn-hover': '0 8px 0 rgba(209, 213, 219, 1)',
        'jelly-btn-active': '0 0px 0 rgba(209, 213, 219, 1)',
        'jelly-btn-color': '0 6px 0 rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-fast': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
