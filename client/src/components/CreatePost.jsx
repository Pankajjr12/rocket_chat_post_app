import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  CloseButton,
  Flex,
  FormControl,
  Input,
  Modal,
  Text,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  Image,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useRef, useState, useEffect } from "react";
import usePreviewVideo from "../hooks/useVideoPreview";
import usePreviewImg from "../hooks/usePreviewImg";
import {
  BsCameraVideoFill,
  BsFillCameraVideoFill,
  BsImageFill,
} from "react-icons/bs";
import { useRecoilState, useRecoilValue } from "recoil";
import postAtom from "../atoms/postAtom";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";
import VideoPlayer from "./VideoPlayer"; // Adjust the path as per your project structure

const MAX_CHAR = 500;
const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = useRef(null);
  const [postText, setPostText] = useState("");
  const [loading, setLoading] = useState(false);
  const finalRef = useRef(null);
  
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
  const videoPlayerRef = useRef(null); // Ref to access VideoPlayer component

  const user = useRecoilValue(userAtom);
  const showToast = useShowToast();

  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const imageRef = useRef(null);
  const { handleVideoChange, videoUrl, setVideoUrl } = usePreviewVideo();
  const videoRef = useRef(null);
  const [posts, setPosts] = useRecoilState(postAtom);
  const { username } = useParams();
  
  useEffect(() => {
    // Access the VideoPlayer component's ref to pause video on modal open
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pauseVideo();
    }
  }, [isOpen]);

  const handleTextChange = (e) => {
    const inputText = e.target.value;

    if (inputText.length > MAX_CHAR) {
      const truncatedText = inputText.slice(0, MAX_CHAR);
      setPostText(truncatedText);
      setRemainingChar(0);
    } else {
      setPostText(inputText);
      setRemainingChar(MAX_CHAR - inputText.length);
    }
  };

  const handleCreatePost = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postedBy: user._id, text: postText, image: imgUrl, video: videoUrl }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post created successfully", "success");
      if (username === user.username) {
        setPosts([data.newPost, ...posts]);
      }
      onClose();
      setPostText("");
      setImgUrl("");
      setVideoUrl("");
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        position={"fixed"}
        bottom={5}
        right={4}
        onClick={onOpen}
        leftIcon={<AddIcon />}
        bg={useColorModeValue("gray.300", "gray.dark")}
        size={{ base: "sm", sm: "md" }}
      >
        Post
      </Button>
      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
        motionPreset="slideInBottom" // Optional animation
        size="sm" // Optional size adjustment
        isCentered // Center the modal vertically and horizontally
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Textarea
                ref={initialRef}
                placeholder="Please type your content.."
                onChange={handleTextChange}
                value={postText}
              />
              <Text
                fontSize="xs"
                fontWeight="bold"
                textAlign={"right"}
                m={"1"}
                color={"gray.500"}
              >
                {remainingChar}/{MAX_CHAR}
              </Text>
            </FormControl>
            <Flex gap={5}>
              <Input
                type="file"
                hidden
                ref={imageRef}
                onChange={handleImageChange}
              />
              <BsImageFill
                style={{
                  marginTop: "12px",
                  marginLeft: "6px",
                  cursor: "pointer",
                }}
                size={22}
                onClick={() => imageRef.current.click()}
              />

              <Input
                type="file"
                hidden
                ref={videoRef}
                onChange={handleVideoChange}
              />
              <BsCameraVideoFill
                style={{
                  marginTop: "12px",
                  marginLeft: "6px",
                  cursor: "pointer",
                }}
                size={22}
                onClick={() => videoRef.current.click()}
              />
            </Flex>
            {imgUrl && (
              <Flex mt={5} w={"full"} position={"relative"}>
                <Image src={imgUrl} alt="Selected img" />
                <CloseButton
                  onClick={() => {
                    setImgUrl("");
                  }}
                  bg={"gray.800"}
                  position={"absolute"}
                  top={2}
                  right={2}
                />
              </Flex>
            )}

            {videoUrl && (
              <Flex mt={5} w={"full"} position={"relative"}>
                {/* Pass ref to VideoPlayer component */}
                <VideoPlayer ref={videoPlayerRef} src={videoUrl} />
                <CloseButton
                  onClick={() => {
                    setVideoUrl("");
                  }}
                  bg={"gray.800"}
                  position={"absolute"}
                  top={1}
                  right={5}
                />
              </Flex>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleCreatePost}
              isLoading={loading}
            >
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;
