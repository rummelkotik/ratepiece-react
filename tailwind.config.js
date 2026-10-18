/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        'bg-main': 'var(--bg-main)',
        'bg-sidebar': 'var(--bg-sidebar)',
        'bg-card': 'var(--bg-card)',
        'bg-input': 'var(--bg-input)',
        'glass-bg': 'var(--glass-bg)',
        'glass-border': 'var(--glass-border)',
        'accent-orange': '#ff7a00',
        'accent-orange-hover': '#ff9433',
        'accent-cyan': 'var(--accent)',
        'accent-cyan-text': 'var(--accent)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'border-color': 'var(--border-color)',
        'border-card': 'var(--border-card)',
      },
      borderRadius: {
        'card': '16px',
        'card-sm': '10px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.15)',
        'glow-orange': '0 0 25px rgba(255, 122, 0, 0.35)',
        'glow-orange-sm': '0 0 12px rgba(255, 122, 0, 0.25)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
