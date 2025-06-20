import { HStack } from '@chakra-ui/react'
import { LeftContent } from './NavbarContent'
// import { RightContent } from './RightContent'

export type MenuProps = Array<{
  label: string
  uri: string
}>

// const menuItems: MenuProps = [
//   {
//     label: 'Sign Up',
//     uri: '',
//   },
//   {
//     label: 'Login',
//     uri: '/login',
//   }
// ]

export function Navbar() {
  return (
    <>
      <HStack justifyContent="space-between" alignItems="center" p="4" bg="blue.normal">
        <LeftContent/>
        {/* <RightContent items={menuItems}/> */}
      </HStack>
    </>
  )
}