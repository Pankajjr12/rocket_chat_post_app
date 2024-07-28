import {
  Button,
  Flex,
  Text,
  FormControl,
  FormLabel,
  Heading,
  InputGroup,
  InputRightElement,
  Input,
  Stack,
  Box,

  useColorModeValue,
  Link, // Import useBreakpointValue hook
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import useShowToast from "../hooks/useShowToast";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import userAtom from "../atoms/userAtom";
import ForgotPassword from "./ForgotPassword";


export default function LoginCard() {

  const [showPassword, setShowPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const [loading, setLoading] = useState(false);
  const [openReplyModal, setOpenReplyModal] = useState(false);

  const handleOpenReplyModel = () => setOpenReplyModal(true);
  const handleCloseReplyModel = () => setOpenReplyModal(false);
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast();
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      console.log(data)
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      showToast("Success", "Logged In Successfully", "success");

      localStorage.setItem("user-rockets", JSON.stringify(data));
      setUser(data);
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setLoading(false);
    }
  };

return (

    <Flex align="center" justify="center">
      <Stack
        spacing={8}
        mx="auto"
        maxW="lg"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.dark")}
          boxShadow={"lg"}
          p={8}
          w={{
            base: "full",
            sm: "400px",
          }}
        >
          <Stack spacing={5} w={"full"} maxW={"md"} px={6} py={6}>
            <Heading fontSize={"2xl"} align={"center"} justify={"center"}>
              Login
            </Heading>
            <FormControl isRequired>
              <FormLabel>Username or Email</FormLabel>
              <Input
                type="email"
                placeholder="Enter username or email."
                _placeholder={{ fontStyle: "italic" }}
                value={inputs.username}
                onChange={(e) =>
                  setInputs((inputs) => ({
                    ...inputs,
                    username: e.target.value,
                  }))
                }
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password."
                  _placeholder={{ fontStyle: "italic" }}
                  value={inputs.password}
                  onChange={(e) =>
                    setInputs((inputs) => ({
                      ...inputs,
                      password: e.target.value,
                    }))
                  }
                />
                <InputRightElement h={"full"}>
                  <Button
                    variant={"ghost"}
                    onClick={() =>
                      setShowPassword((showPassword) => !showPassword)
                    }
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Flex onClick={handleOpenReplyModel}><Link color={useColorModeValue("gray.dark", "gray.100")} fontWeight={"600"}>Forgot Password ?</Link></Flex>
            <Stack spacing={6}>
              <Button
                size="lg"
                loadingText="Logging in"
                isLoading={loading}
                bg={useColorModeValue("gray.600", "gray.700")}
                color={"white"}
                _hover={{
                  bg: useColorModeValue("gray.700", "gray.800"),
                }}
                onClick={handleLogin}
              >
                Login
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={"center"}>
                Don&apos;t have an account?{" "}
                <Link
                  color={"blue.600"}
                  fontWeight={"bold"}
                  onClick={() => setAuthScreen("register")}
                >
                  Register
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
      <ForgotPassword  
  
      open={openReplyModal}
      handleClose={handleCloseReplyModel}
      />
    </Flex>
  );
}
