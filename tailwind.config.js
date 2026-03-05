/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // Use prefix to avoid conflicts with existing CSS
  prefix: 'tw-',
  // Disable important to prevent overriding existing styles
  important: false,
  theme: {
    extend: {},
  },
  plugins: [],
  // Prevent Tailwind from resetting existing styles
  corePlugins: {
    preflight: false,
  },
}
