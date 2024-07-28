import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Flex,
  Stack,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";
import { useSetRecoilState } from "recoil";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputs, setInputs] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputs.password !== inputs.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/users/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: inputs.password }),
        }
      );

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      showToast("Success", "Password Reset Successfully", "success");
    
      localStorage.removeItem("user-rockets", JSON.stringify(data));
      setUser(null)
      navigate('/')
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
          rounded="lg"
          bg={useColorModeValue("white", "gray.dark")}
          boxShadow="lg"
          p={8}
          w={{
            base: "full",
            sm: "400px",
          }}
        >
          <Stack spacing={5} w="full" maxW="md" px={6} py={6}>
            <Heading fontSize="2xl" align="center">
              Create New Password
            </Heading>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  _placeholder={{ fontStyle: "italic" }}
                  value={inputs.password}
                  onChange={(e) =>
                    setInputs((inputs) => ({
                      ...inputs,
                      password: e.target.value,
                    }))
                  }
                />
                <InputRightElement h="full">
                  <Button
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  _placeholder={{ fontStyle: "italic" }}
                  value={inputs.confirmPassword}
                  onChange={(e) =>
                    setInputs((inputs) => ({
                      ...inputs,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
                <InputRightElement h="full">
                  <Button
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {errorMessage && (
              <Box color="red.500" textAlign="center">
                {errorMessage}
              </Box>
            )}

            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              loadingText="Resetting password"
              bg={useColorModeValue("gray.600", "gray.700")}
              color="white"
              _hover={{
                bg: useColorModeValue("gray.700", "gray.800"),
              }}
              onClick={handleSubmit}
            >
              Reset Password
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default ResetPassword;
