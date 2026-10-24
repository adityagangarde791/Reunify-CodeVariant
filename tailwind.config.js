/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020617',
          900: '#0B1120',
          850: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        ice: {
          50: '#F0F7FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
        },
        brand: {
          blue: '#2563EB',
          'blue-bright': '#3B82F6',
          cyan: '#06B6D4',
          'cyan-bright': '#38BDF8',
          teal: '#0D9488',
          'teal-bright': '#14B8A6',
          emerald: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-glow': '0 0 25px -5px rgba(37, 99, 235, 0.25)',
        'cyan-glow': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 12px 30px -4px rgba(15, 23, 42, 0.1), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
        'elevated': '0 20px 40px -10px rgba(11, 17, 32, 0.15)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
