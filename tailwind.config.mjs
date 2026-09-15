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
        primary: "var(--color-primary, #f97316)",
        brand: {
          DEFAULT: "var(--color-primary, #f97316)",
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
