import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#101C2C',
          light: '#18293E',
          dark: '#0A121D',
        },
        lime: {
          DEFAULT: '#B7F34A',
          hover: '#A3E635',
          light: '#DDF8B5',
        },
        mint: '#DDF8B5',
        'light-bg': '#F6F8F5',
        'dark-text': '#17232F',
        'muted-text': '#75818C',
        border: '#E6EBE6',
        success: '#16A36A',
        warning: '#E9A23B',
        danger: '#DC5252',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
