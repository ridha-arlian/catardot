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
  },
  rubik: {
    description: 'For numbering',
    value:{
      fontFamily: 'var(--font-rubik)',
      fontWeight: '500',
      fontSize: '60px',
      lineHeight: '1',
      textDecoration: 'none',
      textTransform: 'none',
    }
  },
  rubikSecond: {
    description: 'For text',
    value:{
      fontFamily: 'var(--font-rubik)',
      fontWeight: '400',
      fontSize: '35px',
      letterSpacing: '0.1em',
      textDecoration: 'none',
      textTransform: 'none',
    }
  },
  rubikThird: {
    description: 'For calendar header',
    value:{
      fontFamily: 'var(--font-rubik)',
      fontWeight: '600',
      fontSize: '25px',
      lineHeight: '1.2',
      letterSpacing: '0.1em',
      textDecoration: 'none',
      textTransform: 'none',
    }
  },
  rubikFour: {
    description: 'For calendar number',
    value:{
      fontFamily: 'var(--font-rubik)',
      fontWeight: '400',
      fontSize: '20px',
      lineHeight: '1',
      letterSpacing: '0.1em',
      textDecoration: 'none',
      textTransform: 'none',
    }
  },
  rubikFive: {
    description: 'For calendar day',
    value:{
      fontFamily: 'var(--font-rubik)',
      fontWeight: '400',
      fontSize: '16px',
      lineHeight: '1',
      textDecoration: 'none',
      textTransform: 'none',
    }
  },
  rubikSix: {
    description: 'For calendar date',
    value:{
      fontFamily: 'var(--font-rubik)',
      fontWeight: '300',
      fontSize: '15px',
      lineHeight: '1',
      letterSpacing: '0.1em',
      textDecoration: 'none',
      textTransform: 'none',
    }
  },
  rubikSeven: {
    description: 'For calendar footer',
    value:{
      fontFamily: 'var(--font-rubik)',
      fontWeight: '300',
      fontSize: '15px',
      lineHeight: '1',
      letterSpacing: '0.1em',
      textDecoration: 'none',
      textTransform: 'none',
    }
  }
})