/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lavender: '#D1B3D1',
        gold: '#D4AF37'
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        // Was 'Montserrat', which the app never loads -- every `font-sans`
        // element silently fell back to a system font while Outfit (the actual
        // body font, set on <body>) went unused by those elements.
        sans: ['Outfit', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
