'use client'


// import { LoginForm } from '../components/auth/login'
import { Navbar } from '../components/navbar/Navbar'
import { Stack } from '@chakra-ui/react'

export default function LoginPage() {
  return (
    <>
      {/* <HStack justifyContent="space-between" alignItems="center" p="3" bg="blue.normal">
        <LeftContent/>
      </HStack> */}
      <Navbar/>
      <Stack alignItems="center" paddingTop="100px" bg="blue.normal">
        {/* <LoginForm/> */}
      </Stack>
    </>
  )
}