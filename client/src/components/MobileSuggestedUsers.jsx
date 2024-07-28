import React, { useState, useEffect } from "react";
import { Flex, Box, Text, Avatar } from "@chakra-ui/react";

import useShowToast from "../hooks/useShowToast";
import { Link } from "react-router-dom";

const MobileSuggestedUsers = () => {
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const showToast = useShowToast();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users/suggested");
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setSuggestedUsers(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, [showToast]);

  return (
    <Box display={{ base: "block", md: "none" }}>
      <Text mb={4} fontWeight="bold">
        Suggested Users
      </Text>
      <Flex
        maxW={"100%"}
        overflowX="scroll"
        my={5}
        gap={2.5}
        css={{
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {!loading &&
          suggestedUsers.map((user) => (
            <Link
              key={user._id}
              to={`/${user?.username}`}
              _hover={{
                textDecoration: "none",
              }}
              style={{ textDecoration: "none" }} // Ensure Link does not apply default underline
            >
              <Flex
                direction={"column"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                <Avatar
                  size="lg"
                  name={user?.username}
                  src={user?.profilePic}
                  bgGradient="linear(to-r, #f02266, #ff6f48)"
                  boxShadow="md"
                />
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  isTruncated
                  mt={1}
                >
                  {user?.username}
                </Text>
              </Flex>
            </Link>
          ))}
      </Flex>
    </Box>
  );
};

export default MobileSuggestedUsers;
