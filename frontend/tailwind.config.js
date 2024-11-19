/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#92d050",
        "primary-dark": "#79b73c",
        "primary-darker": "#5bae5e",
      },
      boxShadow: {
        card: "0 2px 4px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 4px 8px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
