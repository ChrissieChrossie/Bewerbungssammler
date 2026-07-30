export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        secondary: '#D946EF',
        accent: '#F59E0B',
        danger: '#EF4444',
      },
      boxShadow: {
        glow: '0 8px 24px -4px rgba(124, 58, 237, 0.35)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        blob: 'blob 16s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
