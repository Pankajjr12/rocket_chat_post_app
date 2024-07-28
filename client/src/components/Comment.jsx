import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
import userGetProfile from "../hooks/userGetProfile";

const Comment = ({ reply, lastReply }) => {
	const { user, loading } = userGetProfile()
	const navigate = useNavigate()
	const handleClick = () => {
		// Navigate to the user's profile or any desired route
		navigate(`/${reply?.username}`);
	  };
	return (
		<>
			<Flex gap={4} py={2} my={2} w={"full"}>
				<Avatar src={reply.userProfilePic} size={"sm"} onClick={handleClick} />
				<Flex gap={1} w={"full"} flexDirection={"column"}>
					<Flex w={"full"} justifyContent={"space-between"} alignItems={"center"} onClick={handleClick}>
						<Text fontSize='sm' fontWeight='bold'>
							{reply.username}
						</Text>
					</Flex>
					<Text>{reply.text}</Text>
				</Flex>
			</Flex>
			{!lastReply ? <Divider /> : null}
		</>
	);
};

export default Comment;
