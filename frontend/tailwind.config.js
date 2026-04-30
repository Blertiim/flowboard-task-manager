/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      boxShadow: {
        board: "0 24px 80px rgba(15, 23, 42, 0.15)",
        card: "0 14px 36px rgba(15, 23, 42, 0.14)"
      },
      colors: {
        board: {
          sand: "#f6efe7",
          ink: "#132238",
          coral: "#ff7a59",
          ocean: "#3c6df0",
          mint: "#2cb67d",
          night: "#07111f"
        }
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        }
      },
      animation: {
        floatIn: "floatIn 0.35s ease-out"
      }
    }
  },
  plugins: []
};
