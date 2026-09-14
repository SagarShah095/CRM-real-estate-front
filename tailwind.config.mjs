/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "var(--color-primary-50, #fff7ed)",
          100: "var(--color-primary-100, #ffedd5)",
          200: "var(--color-primary-200, #fed7aa)",
          300: "var(--color-primary-300, #fdba74)",
          400: "var(--color-primary-400, #fb923c)",
          500: "var(--color-primary-500, #f97316)",
          600: "var(--color-primary-600, #ea580c)",
          700: "var(--color-primary-700, #c2410c)",
          800: "var(--color-primary-800, #9a3412)",
          900: "var(--color-primary-900, #7c2d12)",
        },
        brand: {
          50: "var(--color-primary-50, #fff7ed)",
          100: "var(--color-primary-100, #ffedd5)",
          200: "var(--color-primary-200, #fed7aa)",
          300: "var(--color-primary-300, #fdba74)",
          400: "var(--color-primary-400, #fb923c)",
          500: "var(--color-primary-500, #f97316)",
          600: "var(--color-primary-600, #ea580c)",
          700: "var(--color-primary-700, #c2410c)",
          800: "var(--color-primary-800, #9a3412)",
          900: "var(--color-primary-900, #7c2d12)",
          bg: "var(--color-brand-bg, #ffffff)",
          surface: "var(--color-brand-surface, #fffbf7)",
          card: "var(--color-brand-card, #ffffff)",
          text: "var(--color-brand-text-main, #0f172a)",
          muted: "var(--color-brand-text-muted, #64748b)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
