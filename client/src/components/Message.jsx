import {
  Avatar,
  Flex,
  Text,
  Box,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Skeleton,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import { BsCheck2All } from "react-icons/bs";
import VideoPlayer from "./VideoPlayer";

const Message = ({ ownMessage, message }) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const user = useRecoilValue(userAtom);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const toggleFullscreen = () => {
    setIsImageFullscreen(!isImageFullscreen);
  };

  return (
    <>
      {ownMessage ? (
        <Flex gap={2} alignSelf={"flex-end"}>
          {message.text && (
            <Flex bg={"green.800"} maxW={"350px"} p={1} borderRadius={"md"}>
              <Text color={"white"}>{message.text}</Text>
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}

          {message.image && !imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image
                src={message?.image}
                hidden
                onLoad={() => setImgLoaded(true)}
                alt="Message image"
                borderRadius={4}
              />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}

          {message.image && imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image
                src={message?.image}
                alt="Message image"
                borderRadius={4}
              />
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}

          {/* {true && (
            <Flex mt={5} alignSelf="flex-end">
              <Box
                onClick={toggleFullscreen}
                cursor="pointer"
                rounded="md" // Adjust the "md" size as needed for your desired rounded corner radius
                overflow="hidden"
                border="1px solid #E2E8F0"
              >
                <VideoPlayer
                  src="https://res.cloudinary.com/dgw5ltqvc/video/upload/v1720720685/qnuxfqeezm24tbyq79b7.mp4"
                  alt="video"
                />
              </Box>
            </Flex>
          )} */}

          <Avatar src={user?.profilePic} w={7} h={7} />
        </Flex>
      ) : (
        <Flex gap={2}>
          <Avatar src={selectedConversation?.userProfilePic} w={7} h={7} />

          {message.text && (
            <Flex bg={"green.800"} maxW={"350px"} p={1} borderRadius={"md"}>
              <Text color={"white"}>{message.text}</Text>
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}

          {message.image && !imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image
                src={message?.image}
                hidden
                onLoad={() => setImgLoaded(true)}
                alt="Message image"
                borderRadius={4}
              />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}

          {message.image && imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image
                src={message?.image}
                alt="Message image"
                borderRadius={4}
              />
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}
        </Flex>
      )}

      <Modal isOpen={isImageFullscreen} onClose={toggleFullscreen} size="full">
        <ModalOverlay />
        <ModalContent
          bg="black"
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100vh" // Ensure modal content takes full viewport height
          maxW="100vw" // Ensure modal content takes full viewport width
        >
          <ModalBody p={0}>
            <Flex
              alignItems="center"
              justifyContent="center"
              h="100%" // Ensure the flex container takes full modal body height
              w="100%" // Ensure the flex container takes full modal body width
            >
              <Image
                src={message.image}
                alt="fullscreen-image"
                borderRadius={4}
                onClick={toggleFullscreen}
                cursor="pointer"
                maxW="100%"
                maxH="100%"
                objectFit="contain"
              />
            </Flex>
            <ModalCloseButton color="white" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Message;
