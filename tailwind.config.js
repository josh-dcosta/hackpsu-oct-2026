export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0B2A45", 800: "#081E33", 700: "#2A4A63" },
        sun: { DEFAULT: "#FFE27A", 600: "#FFD54A" }, // Valley gold, lightened for buttons
        emerald: { DEFAULT: "#10B981", 50: "#ECFDF5", 100: "#D1FAE5", 500: "#10B981", 600: "#059669", 700: "#047857" },
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
