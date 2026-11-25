/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0D0616",
          900: "#150B22",
          800: "#1E112F",
          700: "#2A1A41",
          600: "#3B2759",
          500: "#523A78",
        },
        violet: {
          DEFAULT: "#8B5CF6",
          hi: "#A583FF",
          lo: "#5A32C2",
          soft: "#C9B5FF",
        },
        coral: {
          DEFAULT: "#FF4D6A",
          hi: "#FF7088",
          lo: "#B82444",
        },
        gold: {
          DEFAULT: "#FFC44D",
          hi: "#FFD880",
          lo: "#C0820F",
        },
        mist: "#F4EEFF",
        mute: "#B9ABD3",
        faint: "#8E7FAB",
      },
      fontFamily: {
        body: ["Heebo", "system-ui", "sans-serif"],
        display: ["Karantina", "Heebo", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,92,246,0.25), 0 24px 60px -24px rgba(139,92,246,0.55)",
        card: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 20px 40px -24px rgba(0,0,0,0.8)",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px)" },
          "40%": { transform: "translateX(8px)" },
          "60%": { transform: "translateX(-6px)" },
          "80%": { transform: "translateX(6px)" },
        },
        sweep: { to: { transform: "rotate(360deg)" } },
        ping2: {
          "0%": { transform: "scale(0.35)", opacity: "0.9" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        shake: "shake 0.45s ease-in-out",
        sweep: "sweep 2.6s linear infinite",
        ping2: "ping2 2.4s cubic-bezier(0.2,0.6,0.3,1) infinite",
        floaty: "floaty 4s ease-in-out infinite",
        blink: "blink 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
