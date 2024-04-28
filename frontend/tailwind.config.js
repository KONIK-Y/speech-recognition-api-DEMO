/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./index.html",
    "./*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      boxShadow:{
        contoso: '0 2px 4px #00000024, 0 0 2px #0000001f'
      }
    },
    fontFamily: {
    }
  },
  plugins: [],
};

export default tailwindConfig;
