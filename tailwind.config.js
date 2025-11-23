/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1', // Indigo 500
        secondary: '#fbbf24', // Amber 400
        accent: '#f472b6', // Pink 400
        background: '#f3f4f6', // Gray 100
        surface: '#ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'flip-in': 'flipIn 0.6s ease-out forwards',
        'bounce-slight': 'bounceSlight 2s infinite',
      },
      keyframes: {
        flipIn: {
          '0%': { transform: 'rotateY(90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        bounceSlight: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}