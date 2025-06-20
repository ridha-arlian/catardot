import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
import { textStyles } from './fonts'

const config = defineConfig({
  theme: {
    textStyles,
    breakpoints: {
      sm: '320px',
      md: '768px',
      lg: '960px',
      xl: '1200px',
    },
    tokens: {
      colors: {
        blue: {
          normal: { value: '#27548A' },
        },
        brown: {
          50: { value: '#FFF8E6' },
          100: { value: '#FFECC2' },
          200: { value: '#FFE099' },
          300: { value: '#FFD470' },
          400: { value: '#EEBE4C' },
          500: { value: '#DDA853' }, // warna utama
          600: { value: '#C99A4B' },
          700: { value: '#B58B43' },
          800: { value: '#A17C3B' },
          900: { value: '#8D6D33' },
        }
      },
    },
    semanticTokens: {
      colors: {
        brown: {
          solid: { value: '{colors.brown.500}' },
          contrast: { value: '{colors.brown.50}' }, // Warna teks di atas solid
          fg: { value: '{colors.brown.500}' }, // Foreground untuk teks, ikon
          muted: { value: '{colors.brown.100}' },
          subtle: { value: '{colors.brown.200}' },
          emphasized: { value: '{colors.brown.300}' },
          focusRing: { value: '{colors.brown.500}' },
        },
      },
    },
    keyframes: {
      spin: {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)