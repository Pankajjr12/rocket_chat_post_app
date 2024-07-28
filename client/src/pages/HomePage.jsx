import { Button, Flex, Spinner, Box, Divider } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postAtom";
import Post from "../components/Post";
import SuggestedUsers from "../components/SuggestedUsers";
import MobileSuggestedUsers from "../components/MobileSuggestedUsers";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();
  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true);
      setPosts([]);
      try {
        const res = await fetch("/api/posts/feed");
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        console.log(data);
        setPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    getFeedPosts();
  }, [showToast, setPosts]);

  return (
    <>
      <Divider my={4} />

      <MobileSuggestedUsers/>
      <Flex gap={"10"} alignItems={"flex-start"}>
        <Box flex={70}>
          {!loading && posts.length === 0 && (
            <h1>Follow some users to see the posts</h1>
          )}

          {loading && (
            <Flex justify="center">
              <Spinner size="xl" />
            </Flex>
          )}
          {Array.isArray(posts) ? (
            posts.map((post) => (
              <Post key={post._id} post={post} postedBy={post.postedBy} />
            ))
          ) : (
            <p>No posts available</p>
          )}
        </Box>
        <Box
          flex={30}
          display={{
            base: "none",
            md: "block",
          }}
        >
          <SuggestedUsers />
        </Box>
      </Flex>
    </>
  );
};

export default HomePage;
