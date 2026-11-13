/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        aura: {
          peach: '#FFB896',
          rose: '#FF6B95',
          purple: '#9B51E0',
          violet: '#6366F1',
          cyan: '#38BDF8',
        }
      },
      animation: {
        'mesh-float': 'meshFloat 18s ease-in-out infinite alternate',
        'mesh-spin': 'meshSpin 25s linear infinite',
      },
      keyframes: {
        meshFloat: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(60px, -40px) scale(1.1)' },
          '100%': { transform: 'translate(-40px, 30px) scale(0.95)' },
        },
        meshSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
