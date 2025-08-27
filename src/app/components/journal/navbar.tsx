"use client"

import { motion } from "framer-motion"
import React, { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { ColorModeButton } from "@/components/ui/color-mode"
import { createClient, setSupabaseAuth } from "@/utils/supabase/supabase.client"
import { Flex, HStack, Button, Avatar, Menu, Portal, VStack, Heading, Text, SkeletonCircle } from "@chakra-ui/react"

const MotionFlex = motion.create(Flex)

export const Navbar = () => {
  const { data: session } = useSession()
  const [supabase] = useState(() => createClient())
  const [scrolled, setScrolled] = useState(false)
  
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session === undefined) {
      setIsLoading(true)
    } else {
      setIsLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (session?.supabaseAccessToken) {
      setSupabaseAuth(supabase, session.supabaseAccessToken)
    }
  }, [session, supabase])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <MotionFlex as="nav" position="fixed" top={0} left={0} right={0} zIndex={50} justify="space-between" align="center" px={{ base: 4, md: 8 }} py={{ base: scrolled ? 4 : 3, sm: scrolled ? 4 : 2, md: scrolled ? 4 : 6, lg: scrolled ? 4 : 6, xl: scrolled ? 4 : 6 }} bg={ scrolled ? { base: "whites.bgs", _dark: "blur" } : "transparent" } backdropFilter={ scrolled ? "blur(12px)" : "none" } initial={{ y: -100 }} animate={{ y: 0 }} transitionDuration="0.5s">
    
        <VStack align="start" gap={{ base: 2, sm: 2, md: 4, lg: 4, xl: 4 }}>
          <Heading textStyle="headingNav">
            Catardot.
          </Heading>
          <Text textStyle="subheadingNav" color="gray.500" display={{ base: "none", sm: "none", md: "flex", lg: "flex", xl: "flex" }}>
            Homework for Life by Matthew Dicks
          </Text>
        </VStack>

        <HStack gap={{ base: 1, sm: 2, md: 4, lg: 4, xl: 4 }}>
          <Button rel="noopener noreferrer" size="sm" boxSize={10} variant="ghost" bg="inherit" _hover={{ transform: "scale(1.2) rotate(5deg)", border:"1px solid", borderColor:"sage.500" }} asChild>
            <ColorModeButton />
          </Button>

          <Menu.Root positioning={{ placement: "right-end" }}>
            <Menu.Trigger rounded="full" focusRing="outside">
              {isLoading ? (
                <SkeletonCircle size="11" border="1px solid" borderColor="gray.600"/>
              ) : (
                <Avatar.Root size={{ base: "md", sm: "md", md: "lg", lg: "lg", xl: "lg" }} cursor="pointer">
                  <Avatar.Fallback name={session?.user?.name ?? "Segun Adebayo"} />
                  <Avatar.Image src={session?.user?.image ?? "https://bit.ly/sage-adebayo"} />
                </Avatar.Root>
              )}
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item value="account" textStyle="selectNav">
                    Account
                  </Menu.Item>
                  <Menu.Item value="settings" textStyle="selectNav">
                    Settings
                  </Menu.Item>
                  <Menu.Item value="logout" textStyle="selectNav" onClick={() => signOut({ callbackUrl: "/" })} >
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