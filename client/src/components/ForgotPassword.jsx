import {
  Box,
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useState } from "react";
import useShowToast from "../hooks/useShowToast";

const ForgotPassword = ({ open, handleClose}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const showToast = useShowToast();
  const [isReplying, setIsReplying] = useState(false);
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email: email}),
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      showToast("Success", "Check your email for reset password link!", "success");
      localStorage.setItem("user-rockets", JSON.stringify(data));
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box>
      <Modal
        isOpen={open}
        onClose={handleClose}
        motionPreset="slideInBottom" // Optional animation
        size="sm" // Optional size adjustment
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg={useColorModeValue("white", "gray.dark")}>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={3}>
              <Input
                placeholder="Type your registered email ..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              size={"sm"}
              mr={3}
              isLoading={isReplying}
              onClick={handleForgotPassword}
            >
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ForgotPassword;
