import { Container, Flex, Heading, HStack, Button } from '@chakra-ui/react'
import { MenuProps } from './Navbar'
import { useRouter } from 'next/navigation'

type RightContentProps = {
  items: MenuProps
}

export function LeftContent(){
  return (
    <>
      <HStack>
        <Container>
          <Flex gap="3">
            <Heading textStyle="gugi" color="brown.500">
              cowSpace
            </Heading>
          </Flex>
        </Container>
      </HStack>
    </>
  )
}

export function RightContent({ items }: RightContentProps){
  const router = useRouter()

  return (
    <>
      <HStack>
        <Container>
          <Flex gap="3">
            {items.map((item, index) => (
              <Button key={index} variant="ghost" colorPalette="brown" _hover={{color: "black"}} onClick={() => item.uri !== '#' && router.push(item.uri)}>
                {item.label}
              </Button>
            ))}
          </Flex>
        </Container>
      </HStack>
    </>
  )
}