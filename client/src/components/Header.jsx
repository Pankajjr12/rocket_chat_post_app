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
  const { colorMode, toggleColorMode } = useColorMode("dark");
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
      if (window.scrollY > 50) {
        setShowLogout(false);
      } else {
        setShowLogout(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [user]);

  return (
    <>
      <div style={{ position: "fixed", top: 10, left: 10, zIndex: 1000, }}>
        <div
          style={{
            backgroundColor: "#222222",
            padding: 6,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}

          onClick={handleBack}
        >
          <MdOutlineArrowBackIosNew size={18} style={{ marginRight: 5 }} />
          <span style={{ color: "white", fontSize: 14 }}>Back</span>
        </div>
      </div>
      <Flex align="center" justify="space-between" mt={4} h="15vh">
        {!user && (
          <Link
            as={RouterLink}
            to={"/auth"}
            onClick={() => setAuthScreen("login")}
          >
            Login
          </Link>
        )}
        <Flex direction="row" align="center" justify="flex-end" my={2}>
          <Image
            borderRadius="full"
            boxSize={{ base: "65px", md: "120px" }}
            cursor="pointer"
            alt="logo"
            onClick={handleToggleColorMode}
            src={logo}
            // Margin bottom to create space between image and text
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
                size={"xs"}
                onClick={logout}
                gap={2}
                padding={5}
                margin={1}
              >
                <FiLogOut size={15} />{" "}
                <span style={{ fontSize: "15px" }}>Logout</span>
              </Button>
            </motion.div>
          </Flex>
        )}

        {!user && (
          <Link
            as={RouterLink}
            to={"/auth"}
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
