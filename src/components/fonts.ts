import { defineTextStyles } from '@chakra-ui/react'

export const textStyles = defineTextStyles({
  gugi: {
    description: 'The body text style - used in paragraphs',
    value: {
      fontFamily: 'var(--font-gugi)',
      fontWeight: '400',
      fontSize: '25px',
      lineHeight: '24px',
      letterSpacing: '0px',
      textDecoration: 'none',
      textTransform: 'none',
    },
  },
  open: {
    description: 'For Typography',
    value: {
      fontFamily: 'var(--font-open-sans)',
      fontWeight: '500',
      fontSize: '20px',
      lineHeight: '24px',
      letterSpacing: '0px',
      textDecoration: 'none',
      textTransform: 'none',
    }
  },
  roboto: {
    description: 'For Landing Page',
    value: {
      fontFamily: 'var(--font-roboto-mono)',
      fontWeight: '500',
      fontSize: '30px',
      lineHeight: '120px',
      letterSpacing: '0px',
      textDecoration: 'none',
      textTransform: 'none',
    }
  }
})