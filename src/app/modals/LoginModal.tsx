'use client'
// import * as Yup from 'yup';
// import { useFormik } from 'formik';
import { Button, Dialog, Portal, Stack, Text, Box, Link, HStack, Spinner, CloseButton } from "@chakra-ui/react";
import { useState, Suspense, lazy } from "react";
// import { login } from "../module/_requests";
// import { LoginResponse } from "../helper/_models";

const GoogleIcon    = lazy(() => import('../../components/icons/GoogleIcon'));
// const GithubIcon    = lazy(() => import('../../components/icons/GithubIcon'));
// const LinkedinIcon  = lazy(() => import('../../components/icons/LinkedinIcon'));
// const FacebookIcon  = lazy(() => import('../../components/icons/FacebookIcon'));
// const AppleIcon     = lazy(() => import('../../components/icons/AppleIcon'));

// const validationSchema = Yup.object({
//   email: Yup.string().email("Invalid email").required("Email is required"),
//   password: Yup.string().min(6, "Minimum 6 characters").required("Password is required")
// })

const IconFallback = () => (
  <Spinner size="sm" color="gray.400"/>
);

export function LoginModal () {
  const [hovered, setHovered] = useState(false);
  // const [isOpen, setIsOpen] = useState(false);

  // const formik = useFormik({
  //   initialValues: {
  //     email: "",
  //     password: "",
  //   },
  //   validationSchema, onSubmit: async (values, { setSubmitting, setStatus }) => {
  //     try {
  //       const response = await login(values.email, values.password);
  //       const data: LoginResponse = response.data;
                
  //       if (data.success) {
  //         if (data.accessToken) {
  //           localStorage.setItem('accessToken', data.accessToken);
  //         }
  //         console.log("Login berhasil:", data);
  //         setIsOpen(false);
  //       } else {
  //         setStatus(data.message || "Login gagal");
  //       }
  //     } catch (error: unknown) {
  //       let errorMessage = "Terjadi kesalahan";
        
  //       if (error instanceof Error) {
  //         errorMessage = error.message;
  //       } else if (typeof error === 'object' && error !== null && 'response' in error) {
  //         const axiosError = error as { response?: { data?: { message?: string } } };
  //         errorMessage = axiosError.response?.data?.message || "Terjadi kesalahan";
  //       }
        
  //       setStatus(errorMessage);
  //     } finally {
  //       setSubmitting(false);
  //     }
  //   },
  // })

  // const handleModalClose = () => {
  //   setIsOpen(false);
  //   formik.resetForm();
  //   setHovered(false);
  // };

  // const handleModalOpen = () => {
  //   setIsOpen(true);
  //   formik.resetForm();
  //   setHovered(false);
  // };
  
  // const ref = useRef<HTMLInputElement>(null);
  
  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button variant='outline' colorPalette="brown" fontSize="18px" px="30px" py="15px" _hover={{ color: "black", boxShadow: "0px 14px 30px -15px rgba(0, 0, 0, 0.75)" }} width={{ base: "80%", md: "auto" }} margin={{ base: "0 auto", md: "unset" }}>
            Login
          </Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop tabIndex={-1} aria-hidden="true" style={{ pointerEvents: 'auto' }}/>
          <Dialog.Positioner>
            <Dialog.Content borderRadius="lg" maxW="md" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description">
              <Dialog.Header>
                <Dialog.Title fontSize="xl">
                  Login to your account
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton position="absolute" top="3" right="3" size="md" variant="ghost" aria-label="Close dialog" tabIndex={0}/>
                </Dialog.CloseTrigger>
              </Dialog.Header>

              <Dialog.Body id="dialog-description">
                <HStack gap="3" mb="6" justifyContent="center">
                  {/* <Button variant="outline" px="2" py="7" rounded="lg" justifyContent="center" color="white" _hover={{ bg: "brown.500", color: "#161514" }} aria-label="Login with Github" tabIndex={0}>
                    <Suspense fallback={<IconFallback />}>
                      <GithubIcon/>
                    </Suspense>
                  </Button> */}
                  {/* <Button variant="outline" px="2" py="7" rounded="lg" justifyContent="center" color="#0A66C2" _hover={{ bg: "brown.500", color:"black" }} aria-label="Login with LinkedIn" tabIndex={0}>
                    <Suspense fallback={<IconFallback />}>
                      <LinkedinIcon/>
                    </Suspense>
                  </Button> */}
                  <Button variant="outline" px="2" py="7" rounded="lg" justifyContent="center" _hover={{ bg: "brown.500", color: "black" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} aria-label="Login with Google" tabIndex={0}>
                    <Suspense fallback={<IconFallback />}>
                      <GoogleIcon isHovered={hovered}/>
                    </Suspense>
                  </Button>
                  {/* <Button variant="outline" px="2" py="7" rounded="lg" justifyContent="center" color="#4460A0" _hover={{ bg: "brown.500", color:"black" }} aria-label="Login with Facebook" tabIndex={0}>
                    <Suspense fallback={<IconFallback />}>
                      <FacebookIcon/>
                    </Suspense>
                  </Button>
                  <Button variant="outline" px="2" py="7" rounded="lg" justifyContent="center" color="white" _hover={{ bg: "brown.500", color: "#0B0B0A" }} aria-label="Login with Apple" tabIndex={0}>
                    <Suspense fallback={<IconFallback />}>
                      <AppleIcon/>
                    </Suspense>
                  </Button> */}
                </HStack>

                <Stack direction="row" align="center" my="6">
                  <Box flex="1" h="1px" bg="gray.200" aria-hidden="true"/>
                  <Text fontSize="sm" color="gray.500">
                    OR
                  </Text>
                  <Box flex="1" h="1px" bg="gray.200" aria-hidden="true"/>
                </Stack>

                {/* <form onSubmit={formik.handleSubmit} noValidate>
                  <Stack gap={3}>
                    {formik.status && (
                      <Text color="red.500" fontSize="sm" textAlign="center" role="alert" aria-live="polite">
                        {formik.status}
                      </Text>
                    )}
                    
                    <Field.Root>
                      <Input name="email" type="email" autoComplete="email" placeholder="Email Address" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.email} aria-label="Email Address" aria-invalid={formik.touched.email && formik.errors.email ? 'true' : 'false'} aria-describedby={formik.touched.email && formik.errors.email ? 'email-error' : undefined} tabIndex={0}/>
                      {formik.touched.email && formik.errors.email && (
                        <Field.ErrorText id="email-error" fontSize="sm" color="red.500" role="alert">{formik.errors.email}</Field.ErrorText>
                      )}
                    </Field.Root>

                    <Field.Root>
                      <Input name="password" type="password" autoComplete="current-password" placeholder="Password" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.password} aria-label="Password" aria-invalid={formik.touched.password && formik.errors.password ? 'true' : 'false'} aria-describedby={formik.touched.password && formik.errors.password ? 'password-error' : undefined} tabIndex={0}/>
                      {formik.touched.password && formik.errors.password && (
                        <Field.ErrorText id="password-error" role="alert" fontSize="sm" color="red.500">{formik.errors.password}</Field.ErrorText>
                      )}
                    </Field.Root>

                    <Box textAlign="right">
                      <Link href="/forgot-password" fontSize="sm" color="blue.600" tabIndex={0}>
                        Reset your password?
                      </Link>
                    </Box> */}

                    {/* <Button type="submit" colorPalette="brown" color="black" _hover={{ color: "black", boxShadow: "0px 14px 30px -15px rgba(0, 0, 0, 0.75)" }} loading={formik.isSubmitting} disabled={formik.isSubmitting} tabIndex={0}>
                      {formik.isSubmitting ? "Signing in..." : "Sign in"}
                    </Button> */}
                  {/* </Stack>
                </form> */}

                <Text mt="6" textAlign="center" fontSize="sm" color="gray.600">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" color="blue.500" tabIndex={0}>
                    Sign up
                  </Link>
                </Text>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}

export default LoginModal