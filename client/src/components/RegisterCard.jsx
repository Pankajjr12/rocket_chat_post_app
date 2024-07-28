import {
  Button,
  Checkbox,
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
  Link,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";

export default function RegisterCard() {
  const [showPassword, setShowPassword] = useState(false);
  const showToast = useShowToast();
  const setUser = useSetRecoilState(userAtom);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const [inputs, setInputs] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const handleSignup = async () => {
    console.log(inputs);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Registered Successfully", "success");

      localStorage.setItem("user-rockets", JSON.stringify(data));
      setUser(data);
    } catch (error) {
      showToast("Error", error, "error");
    }
  };
  return (
    <Stack direction={{ base: "column", md: "row" }} mb={5}>
      <Flex flex={1} align={"center"} justify={"center"}>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.dark")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={6} w={"full"} maxW={"md"} px={1} py={6}>
            <Heading
              fontSize={"2xl"}
              align={"center"}
              justify={"center"}
              mb={2}
            >
              Sign in to your account
            </Heading>
            <HStack>
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter fullname."
                  _placeholder={{ fontStyle: "italic" }}
                  onChange={(e) =>
                    setInputs({ ...inputs, name: e.target.value })
                  }
                  value={inputs.name}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>User Name</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter username."
                  _placeholder={{ fontStyle: "italic" }}
                  onChange={(e) =>
                    setInputs({ ...inputs, username: e.target.value })
                  }
                  value={inputs.username}
                />
              </FormControl>
            </HStack>
            <FormControl isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                placeholder="Enter email."
                _placeholder={{ fontStyle: "italic" }}
                onChange={(e) =>
                  setInputs({ ...inputs, email: e.target.value })
                }
                value={inputs.email}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password."
                  _placeholder={{ fontStyle: "italic" }}
                  onChange={(e) =>
                    setInputs({ ...inputs, password: e.target.value })
                  }
                  value={inputs.password}
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
            <Stack spacing={6}>
              <Stack
                direction={{ base: "column", sm: "row" }}
                align={"start"}
                justify={"space-between"}
              >
                <Checkbox>Remember me</Checkbox>
                <Text color={"blue.500"}>Forgot password?</Text>
              </Stack>
              <Button
                size="lg"
                loadingText="Creating"
                bg={useColorModeValue("gray.600", "gray.700")}
                color={"white"}
                _hover={{
                  bg: useColorModeValue("gray.700", "gray.800"),
                }}
                onClick={handleSignup}
              >
                Register
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={"center"}>
                Already a user?{" "}
                <Link
                  color={"blue.600"}
                  fontWeight={"bold"}
                  onClick={() => setAuthScreen("login")}
                >
                  Login
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Flex>
    </Stack>
  );
}
