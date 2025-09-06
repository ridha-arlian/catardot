import { textStyles } from "@/components/fonts"
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    textStyles,
    // breakpoints: {
    //   sm: "320px",
    //   md: "768px",
    //   lg: "960px",
    //   xl: "1200px",
    // },
    tokens: {
      colors: {
        brand: {
          50: { value: "#f0fdf4" },
          100: { value: "#dcfce7" },
          200: { value: "#bbf7d0" },
          300: { value: "#86efac" },
          400: { value: "#4ade80" },
          500: { value: "#22c55e" },
          600: { value: "#16a34a" },
          700: { value: "#15803d" },
          800: { value: "#166534" },
          900: { value: "#14532d" },
        },
        sage: {
          50: { value: "#f6f7f6" },
          100: { value: "#e3e7e3" },
          200: { value: "#c7d0c7" },
          300: { value: "#a3b2a3" },
          400: { value: "#7a8f7a" },
          500: { value: "#5c735c" },
          600: { value: "#485a48" },
          700: { value: "#3c4a3c" },
          800: { value: "#333d33" },
          900: { value: "#2d342d" },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          canvas: {
            value: { base: "{colors.brand.50}", _dark: "{colors.sage.900}" },
          },
          surface: {
            value: { base: "white", _dark: "{colors.sage.800}" },
          },
        },
        fg: {
          default: {
            value: { base: "{colors.sage.800}", _dark: "{colors.sage.100}" },
          },
          muted: {
            value: { base: "{colors.sage.600}", _dark: "{colors.sage.400}" },
          },
        },
        border: {
          default: {
            value: { base: "{colors.sage.200}", _dark: "{colors.sage.700}" },
          },
        },
      },
    },
    keyframes: {
      spin: {
        from: { transform: "rotate(0deg)" },
        to: { transform: "rotate(360deg)" },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)