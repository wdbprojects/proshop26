/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#090b0c",
        card: "#ffffff",
        primary: { DEFAULT: "#ca3500", foreground: "#fff7ed" },
        secondary: "#f4f4f5",
        muted: { DEFAULT: "#f1f3f3", foreground: "#67787c" },
        border: "#e3e7e8",
        destructive: "#e7000b",
      },
    },
  },
  plugins: [],
};
