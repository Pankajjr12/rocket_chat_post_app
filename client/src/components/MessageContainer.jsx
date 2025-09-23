import {
  Avatar,
  Divider,
  Flex,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import messageSound from '../assets/notirocket.mp3';
import MessageInput from "./MessageInput";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";
import SharePostModal from "./SharePostModal";

const MessageContainer = () => {
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState([]);
  const [linkToInsert, setLinkToInsert] = useState(null);
  const [isShareOpen, setShareOpen] = useState(false);

  const currentUser = useRecoilValue(userAtom);
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const { socket } = useSocket();
  const setConversations = useSetRecoilState(conversationsAtom);
  const messageEndRef = useRef(null);
  const showToast = useShowToast();

  useEffect(() => {
    socket.on("newMessage", (message) => {
      if (selectedConversation._id === message.conversationId) {
        setMessages((prev) => [...prev, message]);
      }
      if (!document.hasFocus()) {
        const sound = new Audio(messageSound);
        sound.play();
      }
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === message.conversationId
            ? { ...conversation, lastMessage: { text: message.text, sender: message.sender } }
            : conversation
        )
      );
    });
    return () => socket.off("newMessage");
  }, [socket, selectedConversation, setConversations]);

  useEffect(() => {
    const lastMessageIsFromOtherUser =
      messages.length && messages[messages.length - 1].sender !== currentUser._id;
    if (lastMessageIsFromOtherUser) {
      socket.emit("markMessagesAsSeen", {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId,
      });
    }

    socket.on("messagesSeen", ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
        setMessages((prev) =>
          prev.map((message) => (!message.seen ? { ...message, seen: true } : message))
        );
      }
    });
  }, [socket, currentUser._id, messages, selectedConversation]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const getMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);
      try {
        if (selectedConversation.mock) return;
        const res = await fetch(`/api/messages/${selectedConversation.userId}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setMessages(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingMessages(false);
      }
    };
    getMessages();
  }, [showToast, selectedConversation.userId, selectedConversation.mock]);

  return (
    <Flex flex="80" bg={useColorModeValue("gray.200", "gray.dark")} borderRadius="md" p={1} flexDirection="column">
      {/* Header */}
      <Flex w="full" h={12} alignItems="center" gap={2} mx={2}>
        <Avatar src={selectedConversation?.userProfilePic} size="sm" />
        <Text display="flex" alignItems="center" fontWeight={500}>
          {selectedConversation?.username}
        </Text>
        {/* Share Button */}
        <button onClick={() => setShareOpen(true)} style={{ marginLeft: "auto" }}>
          Share Post
        </button>
      </Flex>

      <Divider my={2} />

      {/* Messages */}
      <Flex flexDir="column" gap={4} my={4} p={2} height="400px" overflowY="auto">
        {loadingMessages &&
          [...Array(5)].map((_, i) => (
            <Flex
              key={i}
              gap={2}
              alignItems="center"
              p={1}
              borderRadius="md"
              alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
            >
              {i % 2 === 0 && <SkeletonCircle size={7} />}
              <Flex flexDir="column" gap={2}>
                <Skeleton h="8px" w="250px" />
                <Skeleton h="8px" w="250px" />
                <Skeleton h="8px" w="250px" />
              </Flex>
              {i % 2 !== 0 && <SkeletonCircle size={7} />}
            </Flex>
          ))}
        {!loadingMessages &&
          messages.map((message) => (
            <Flex
              key={message._id}
              direction="column"
              ref={messages.length - 1 === messages.indexOf(message) ? messageEndRef : null}
            >
              <Message message={message} ownMessage={currentUser._id === message.sender} />
            </Flex>
          ))}
      </Flex>

      {/* Message Input with dynamic link support */}
      <MessageInput setMessages={setMessages} linkToInsert={linkToInsert} />

      {/* Share Post Modal */}
      <SharePostModal
        isOpen={isShareOpen}
        onClose={() => setShareOpen(false)}
        post={{ _id: "6772c3b8503524a191079ea6" }} // Example post
        onInsertLink={(link) => setLinkToInsert(link)}
      />
    </Flex>
  );
};

export default MessageContainer;
