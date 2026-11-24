/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Paleta brutalista: papel crudo, tinta negra y acentos saturados
      colors: {
        ink: '#0a0a0a',
        paper: '#f4f1ea',
        acid: '#d4ff00',
        alarm: '#ff3b1f',
        signal: '#ffd400',
        cobalt: '#2d4bff',
        mint: '#00d68f',
      },
      fontFamily: {
        display: ['"Archivo Black"', 'Impact', 'sans-serif'],
        body: ['Archivo', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      // Sombras duras sin difuminado (sello del neo-brutalismo)
      boxShadow: {
        brut: '6px 6px 0 0 #0a0a0a',
        'brut-sm': '3px 3px 0 0 #0a0a0a',
        'brut-lg': '10px 10px 0 0 #0a0a0a',
        'brut-xl': '14px 14px 0 0 #0a0a0a',
      },
      borderWidth: {
        3: '3px',
      },
      letterSpacing: {
        crush: '-0.05em',
      },
      // Tipografía fluida con clamp(): crece de forma continua entre móvil y 4K
      fontSize: {
        mega: ['clamp(3.5rem, 21vw, 13rem)', { lineHeight: '0.82' }],
        huge: ['clamp(2.25rem, 7vw, 5.5rem)', { lineHeight: '0.88' }],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        'toast-in': {
          '0%': { transform: 'translate3d(0, 120%, 0) rotate(-2deg)' },
          '100%': { transform: 'translate3d(0, 0, 0) rotate(-1deg)' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        blink: 'blink 1s steps(1) infinite',
        'toast-in': 'toast-in 0.35s cubic-bezier(0.2, 1.4, 0.4, 1) both',
      },
    },
  },
  plugins: [],
};
