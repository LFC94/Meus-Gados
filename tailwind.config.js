const { themeColors } = require("./src/theme.config");
const plugin = require("tailwindcss/plugin");

// Função para converter hex para rgba
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const tailwindColors = Object.fromEntries(
  Object.entries(themeColors).map(([name, swatch]) => [
    name,
    {
      DEFAULT: `var(--color-${name})`,
      light: swatch.light,
      dark: swatch.dark,
    },
  ]),
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  // Scan all component and app files for Tailwind classes
  content: [
    "./src/app/**/*.{js,ts,tsx}",
    "./src/components/**/*.{js,ts,tsx}",
    "./src/lib/**/*.{js,ts,tsx}",
    "./src/hooks/**/*.{js,ts,tsx}",
  ],

  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: tailwindColors,
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("light", ':root:not([data-theme="dark"]) &');
      addVariant("dark", ':root[data-theme="dark"] &');
    }),
    // Plugin para criar classes de opacidade personalizadas
    plugin(({ addUtilities }) => {
      const opacityLevels = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90];
      const utilities = {};

      Object.entries(themeColors).forEach(([colorName, swatch]) => {
        opacityLevels.forEach((opacity) => {
          const alpha = opacity / 100;
          // Background com opacidade
          utilities[`.bg-${colorName}\\/${opacity}`] = {
            backgroundColor: hexToRgba(swatch.light, alpha),
          };
          // Border com opacidade
          utilities[`.border-${colorName}\\/${opacity}`] = {
            borderColor: hexToRgba(swatch.light, alpha),
          };
          // Text com opacidade
          utilities[`.text-${colorName}\\/${opacity}`] = {
            color: hexToRgba(swatch.light, alpha),
          };
        });
      });

      addUtilities(utilities);
    }),
  ],
};
