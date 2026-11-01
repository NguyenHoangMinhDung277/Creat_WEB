/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffe',
          300: '#7cc2fd',
          400: '#36a1fa',
          500: '#0c85eb',
          600: '#0066ca',
          700: '#0152a4',
          800: '#064687',
          850: '#0b2649',
          900: '#092140',
          950: '#050f1e',
        },
        holo: {
          cyan: '#00f2fe',
          teal: '#4facfe',
          purple: '#8b5cf6',
          pink: '#ec4899',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'rainbow-spin': 'rainbowSpin 6s linear infinite',
        'rainbow-shift': 'rainbowShift 4s ease infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'float-slow': 'float 5s ease-in-out infinite',
      },
      keyframes: {
        rainbowSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        rainbowShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 0 25px rgba(0, 242, 254, 0.25), 0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-cyan': '0 0 20px rgba(0, 242, 254, 0.45)',
      }
    },
  },
  plugins: [],
}
