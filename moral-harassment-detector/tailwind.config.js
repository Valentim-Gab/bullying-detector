/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#8f3d38',
        secondary: '#632a64',
        positive: '#2e7d32',
        negative: '#c62828',
        warning: '#f57f17',
        muted: {
          DEFAULT: '#f9f9f9',
          strong: '#ccc',
        },
        background: {
          DEFAULT: '#fff',
          secondary: '#ececec',
        },
        foreground: {
          DEFAULT: '#636363',
          strong: '#000',
        },
        card: {
          DEFAULT: '#fff',
          foreground: '#11181C',
        },
        dark: {
          background: {
            DEFAULT: '#151718',
            secondary: '#111',
          },
          card: {
            DEFAULT: '#111',
            foreground: '#ECEDEE',
          },
          muted: {
            DEFAULT: '#444',
            strong: '#000',
          },
        }
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
    },
  },
  plugins: [],
}
