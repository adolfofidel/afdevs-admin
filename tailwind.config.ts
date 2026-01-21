import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#1a365d',
        'brand-secondary': '#2d3748',
        'brand-accent': '#3182ce',
        'brand-gold': '#d69e2e',
        'surface-light': '#f7fafc',
        'surface-border': '#e2e8f0',
      },
    },
  },
  plugins: [],
}
export default config
