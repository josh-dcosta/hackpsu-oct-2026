export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0B2A45", 800: "#081E33", 700: "#2A4A63" },
        sun: { DEFAULT: "#FFE27A", 600: "#FFD54A" }, // Valley gold, lightened for buttons
        emerald: { DEFAULT: "#F5C000", 50: "#FFFAE6", 100: "#FFF2C2", 200: "#FFE68A", 300: "#FFDC5C", 400: "#FFD23F", 500: "#F5C000", 600: "#9A7400", 700: "#7A5C00", 800: "#5E4700", 900: "#433200" }, // "emerald" now = Valley gold accent
        paper: "#F8FAFC", slate: { DEFAULT: "#64748B" }, sky: { soft: "#E0F2FE" },
        coral: "#F97361", amber: { soft: "#FEF3C7", DEFAULT: "#F59E0B" },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      boxShadow: { card: "0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.12)" },
    },
  },
};
