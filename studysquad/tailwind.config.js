export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#df2531",
          black: "#000000",
          dark: "#0a0a0a",
          soft: "#1a1a1a",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(223, 37, 49, 0.35)",
      },
    },
  },
  plugins: [],
}