/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: { 50: '#fffdf8', 100: '#fdf8ee', 200: '#f8efdc', 300: '#f1e3c6' },
        champagne: { 300: '#e9d29a', 400: '#dcbc72', 500: '#c9a24e', 600: '#b08636', 700: '#8c6a2a' },
        cocoa: { 300: '#c4a888', 400: '#a8865f', 500: '#8b6a48', 600: '#6e5236', 700: '#553f2a', 800: '#3d2d1f' },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        luxe: '0 10px 40px -12px rgba(139, 106, 72, 0.25)',
        soft: '0 4px 20px -6px rgba(139, 106, 72, 0.18)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      animation: {
        fadeUp: 'fadeUp .6s ease-out both',
        shimmer: 'shimmer 1.4s linear infinite',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
