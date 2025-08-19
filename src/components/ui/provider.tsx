"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { SessionProvider } from "next-auth/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { system } from "../theme"

export function Provider(props: ColorModeProviderProps) {
  return (
    <SessionProvider>
      <ChakraProvider value={system}>
        <ColorModeProvider {...props} />
      </ChakraProvider>
    </SessionProvider>
  )
}
