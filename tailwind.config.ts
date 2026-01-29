import type { Config } from 'tailwindcss';

const config: Config = {
  // 🛑 Force 'class' mode - prevents system dark mode from affecting the site
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        tajawal: ['var(--font-tajawal)'],
      },
    },
  },
  plugins: [],
};

export default config;
