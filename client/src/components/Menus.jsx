import React from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Link,
  Text,
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { AiFillHome } from "react-icons/ai";
import { Link as RouterLink } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { VscColorMode } from "react-icons/vsc";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const Menus = () => {
  const user = useRecoilValue(userAtom);
  const { colorMode, toggleColorMode } = useColorMode("dark");
  // Determine background color based on the current color mode
  const menuBg = useColorModeValue("white", "gray.700");
  const handleToggleColorMode = () => {
    toggleColorMode();
  };
  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<HamburgerIcon />}
          variant="outline"
        />
        <MenuList bg={menuBg} rounded="lg" boxShadow="lg" p={2}>
          <Link as={RouterLink} to="/">
            <MenuItem>
              <AiFillHome size={22} />
              <Text fontSize="lg" fontWeight="bold" marginLeft={5}>
                Home
              </Text>
            </MenuItem>
          </Link>

          <Link as={RouterLink} to="/chat">
            <MenuItem>
              <BsFillChatQuoteFill size={22} />
              <Text fontSize="lg" fontWeight="bold" marginLeft={5}>
                Chat
              </Text>
            </MenuItem>
          </Link>

          <Link as={RouterLink} to="/settings">
            <MenuItem>
              <MdOutlineSettings size={22} />
              <Text fontSize="lg" fontWeight="bold" marginLeft={5}>
                Settings
              </Text>
            </MenuItem>
          </Link>

          <Link as={RouterLink} to={`/${user.username}`}>
            <MenuItem>
              <RxAvatar size={22} />
              <Text fontSize="lg" fontWeight="bold" marginLeft={5}>
                Profile
              </Text>
            </MenuItem>
          </Link>

          <Link as={RouterLink} onClick={handleToggleColorMode}>
            <MenuItem>
              <VscColorMode size={22} />
              <Text fontSize="lg" fontWeight="bold" marginLeft={5}>
                Theme
              </Text>
            </MenuItem>
          </Link>
          <Link as={RouterLink} to='/about'>
            <MenuItem>
              <VscColorMode size={22} />
              <Text fontSize="lg" fontWeight="bold" marginLeft={5}>
                About
              </Text>
            </MenuItem>
          </Link>
        </MenuList>
      </Menu>
    </>
  );
};

export default Menus;
