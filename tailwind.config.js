/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0a0a0f',
        surface: '#12121a',
        'surface-2': '#1a1a26',
        border: '#2a2a3a',
        'neon-green': '#00ff88',
        'neon-cyan': '#00e5ff',
        'neon-purple': '#bf5fff',
        'neon-yellow': '#ffee00',
        'neon-pink': '#ff2d78',
        'text-primary': '#e8e8f0',
        'text-muted': '#6b6b8a',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
