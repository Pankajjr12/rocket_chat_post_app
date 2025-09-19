import {
  Flex,
  Image,
  Link,
  Text,
  useColorMode,
  Button,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import logo from "../assets/chat_logo_app.png";
import userAtom from "../atoms/userAtom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Menus from "../components/Menus";
import { FiLogOut } from "react-icons/fi";
import authScreenAtom from "../atoms/authAtom";
import useLogout from "../hooks/useLogout";
import { motion } from "framer-motion";
import { MdOutlineArrowBackIosNew } from "react-icons/md";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const navigate = useNavigate();
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const [showLogout, setShowLogout] = useState(true);

  const handleToggleColorMode = () => {
    toggleColorMode();
  };

  const handleBack = () => navigate(-1);

  useEffect(() => {
    const handleScroll = () => {
      setShowLogout(window.scrollY <= 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Back Button */}
      <Button
        leftIcon={<MdOutlineArrowBackIosNew size={14} />}
        onClick={handleBack}
        size="sm"
        variant="solid"
        bg={colorMode === "light" ? "gray.200" : "gray.700"}
        color={colorMode === "light" ? "gray.800" : "white"}
        _hover={{
          bg: colorMode === "light" ? "gray.300" : "gray.600",
          transform: "scale(1.05)",
        }}
        position="fixed"
        top={3}
        left={3}
        zIndex={1000}
        borderRadius="md"
        px={3}
        py={1}
        transition="all 0.2s ease-in-out"
      >
        Back
      </Button>

      <Flex align="center" justify="space-between" mt={4} h="15vh">
        {/* Login Link if not logged in */}
        {!user && (
          <Link
            as={RouterLink}
            to="/auth"
            onClick={() => setAuthScreen("login")}
          >
            Login
          </Link>
        )}

        {/* Logo and Theme Toggle */}
        <Flex direction="row" align="center" justify="flex-end" my={2}>
          <Image
            borderRadius="full"
            boxSize={{ base: "65px", md: "120px" }}
            cursor="pointer"
            alt="logo"
            onClick={handleToggleColorMode}
            src={logo}
          />
          <Text
            onClick={handleToggleColorMode}
            cursor="pointer"
            fontSize={{ base: "xl", sm: "lg", lg: "2xl" }}
            fontWeight="bold"
            sx={{
              animation: "colorChange 3s infinite alternate",
              "@keyframes colorChange": {
                "0%": { color: "#7F00FF" },
                "50%": { color: "#87CEEB" },
                "100%": { color: "#fff" },
              },
            }}
          >
            Rocket Chat
          </Text>
        </Flex>

        {/* Logout Button if logged in */}
        {user && (
          <Flex alignItems={"center"} gap={4}>
            <Menus />
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: showLogout ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "fixed", top: 4, right: 4 }}
            >
              <Button
                size="xs"
                onClick={logout}
                gap={2}
                px={5}
                py={1}
                variant="outline"
              >
                <FiLogOut size={15} />
                <span style={{ fontSize: "15px" }}>Logout</span>
              </Button>
            </motion.div>
          </Flex>
        )}

        {/* Signup Link if not logged in */}
        {!user && (
          <Link
            as={RouterLink}
            to="/auth"
            onClick={() => setAuthScreen("signup")}
          >
            Sign up
          </Link>
        )}
      </Flex>
    </>
  );
};

export default Header;
