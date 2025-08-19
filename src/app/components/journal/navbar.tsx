"use client"

import { motion } from "framer-motion"
import { useSession, signOut } from "next-auth/react"
import React, { useState, useEffect } from "react"
import { ColorModeButton } from "@/components/ui/color-mode"
import { Flex, HStack, Button, Avatar, Menu, Portal, VStack, Heading, Text } from "@chakra-ui/react"

const MotionFlex = motion.create(Flex)

export const Navbar = () => {
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <MotionFlex as="nav" position="fixed" top={0} left={0} right={0} zIndex={50} justify="space-between" align="center" px={{ base: 4, md: 8 }} py={ scrolled ? 3 : 5 } bg={ scrolled ? { base: "whites.bgs", _dark: "blackAlpha.800" } : "transparent" } backdropFilter={ scrolled ? "blur(12px)" : "none" } initial={{ y: -100 }} animate={{ y: 0 }} transitionDuration="0.5s">
    
        <VStack align="start" gap={0}>
          <Heading size="md" fontFamily="serif">
            catardot
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Homework for Life by Matthew Dicks
          </Text>
        </VStack>

        <HStack gap={4}>
          <Button rel="noopener noreferrer" size="sm" boxSize={10} variant="ghost" bg="inherit" _hover={{ transform: "scale(1.2)" }} asChild>
            <ColorModeButton />
          </Button>

          <Menu.Root positioning={{ placement: "right-end" }}>
            <Menu.Trigger rounded="full" focusRing="outside">
              <Avatar.Root size="lg">
                <Avatar.Fallback name={ session?.user?.name ?? "Segun Adebayo" } />
                <Avatar.Image src={ session?.user?.image ?? "https://bit.ly/sage-adebayo" } />
              </Avatar.Root>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item value="account">
                    Account
                  </Menu.Item>
                  <Menu.Item value="settings">
                    Settings
                  </Menu.Item>
                  <Menu.Item value="logout" onClick={() => signOut({ callbackUrl: "/" })} >
                    Logout
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </HStack>
      </MotionFlex>
    </>
  )
}