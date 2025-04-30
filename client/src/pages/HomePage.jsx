import {
  Box,
  Divider,
  Flex,
  Skeleton,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postAtom";
import useShowToast from "../hooks/useShowToast";
import messageSound from "../assets/notirocket.mp3";
import SuggestedUsers from "../components/SuggestedUsers";
import MobileSuggestedUsers from "../components/MobileSuggestedUsers";
import Post from "../components/Post";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();
  const soundPlayedRef = useRef(false);
  const [page] = useState(1); // For future pagination (currently static)
  const POSTS_PER_PAGE = 10;

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    const cached = localStorage.getItem("feedPosts");
    if (cached) {
      setPosts(JSON.parse(cached));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/posts/feed?page=${page}&limit=${POSTS_PER_PAGE}`);
      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
      } else {
        setPosts(data);
        localStorage.setItem("feedPosts", JSON.stringify(data));
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [page, setPosts, showToast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    // Play notification sound after rendering, asynchronously
    if (!soundPlayedRef.current) {
      const timeout = setTimeout(() => {
        const sound = new Audio(messageSound);
        sound.play().catch(() => {}); // Avoid unhandled promise error
        soundPlayedRef.current = true;
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  const renderSkeletons = () =>
    Array.from({ length: POSTS_PER_PAGE }).map((_, idx) => (
      <Skeleton key={idx} height="150px" my={2} borderRadius="md" />
    ));

  return (
    <>
      <Divider my={4} />
      <MobileSuggestedUsers />

      <Flex gap="10" alignItems="flex-start">
        {/* Main Post Feed */}
        <Box flex={70}>
          {loading ? (
            <VStack spacing={4}>{renderSkeletons()}</VStack>
          ) : (
            <>
              {!posts.length ? (
                <Box textAlign="center" fontWeight="medium">
                  Follow some users to see the posts
                </Box>
              ) : (
                posts.map((post) => (
                  <Post key={post._id} post={post} postedBy={post.postedBy} />
                ))
              )}
            </>
          )}
        </Box>

        {/* Suggested Users (hidden on mobile) */}
        <Box flex={30} display={{ base: "none", md: "block" }}>
          <SuggestedUsers />
        </Box>
      </Flex>
    </>
  );
};

export default HomePage;
