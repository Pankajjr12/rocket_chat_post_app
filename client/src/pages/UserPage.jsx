import React, { useEffect, useRef, useState } from "react";
import UserHeader from "../components/UserHeader";
import useShowToast from "../hooks/useShowToast";
import { useParams } from "react-router-dom";
import userGetProfile from "../hooks/userGetProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postAtom";
import {
  Flex,
  Spinner,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import Post from "../components/Post";
import VideoPlayer from "../components/VideoPlayer";

const UserPage = () => {
  const { user, loading } = userGetProfile();
  const { username } = useParams();
  const showToast = useShowToast();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [savedPosts, setSavedPosts] = useState([]);
  const [fetchingPosts, setFetchingPosts] = useState(true);
  const [fetchingSavedPosts, setFetchingSavedPosts] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Refs to control video elements
  const videoRefs = useRef([]);

  useEffect(() => {
    if (activeTabIndex === 0) {
      const getPosts = async () => {
        if (!user) return;
        setFetchingPosts(true);
        try {
          const res = await fetch(`/api/posts/user/${user.username}`);
          const data = await res.json();
          setPosts(data);
        } catch (error) {
          showToast("Error", error.message, "error");
          setPosts([]);
        } finally {
          setFetchingPosts(false);
        }
      };

      getPosts();
    }
  }, [user, showToast, setPosts, activeTabIndex]);

useEffect(() => {
  if (activeTabIndex === 1) {
    const getSavedPosts = async () => {
      try {
        const res = await fetch(`/api/users/saved-posts`, {
          headers: {
          	Authorization: `Bearer ${localStorage.getItem("jwt")}`, // Example header; adjust as needed
          }
        });
        const data = await res.json();
        setSavedPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setSavedPosts([]);
      } finally {
        setFetchingSavedPosts(false);
      }
    };

    getSavedPosts();
  }
}, [user, showToast, activeTabIndex]);


  // Pause all videos when switching tabs
  useEffect(() => {
    videoRefs.current.forEach((ref) => {
      if (ref && ref.pauseVideo) {
        ref.pauseVideo();
      }
    });
  }, [activeTabIndex]);

  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }

  if (!user && !loading) return <h1>User not found ☠️</h1>;

  return (
    <>
      <UserHeader user={user} />

      <Flex w={"full"} direction="column">
        <Tabs
          position="relative"
          variant="unstyled"
          index={activeTabIndex}
          onChange={(index) => setActiveTabIndex(index)}
        >
          <TabList
            display="flex"
            justifyContent="space-between"
            w="full"
            borderBottom="1px solid gray"
          >
            <Tab flex="1" textAlign="center">
              Posts
            </Tab>
            <Tab flex="1" textAlign="center">
              Saved
            </Tab>
          </TabList>
          <TabIndicator
            mt="-1.5px"
            height="2px"
            bg="blue.500"
            borderRadius="1px"
          />
          <TabPanels>
            <TabPanel>
              {fetchingPosts ? (
                <Flex justifyContent={"center"} my={12}>
                  <Spinner size={"xl"} />
                </Flex>
              ) : posts.length === 0 ? (
                <h1>User has no posts.</h1>
              ) : (
                posts.map((post, index) => (
                  <Post
                    key={post._id || index}
                    post={post}
                    postedBy={post.postedBy}
                    videoRef={(ref) => videoRefs.current[index] = ref} // Pass ref to VideoPlayer component
                  />
                ))
              )}
            </TabPanel>
            <TabPanel>
              {fetchingSavedPosts ? (
                <Flex justifyContent={"center"} my={12}>
                  <Spinner size={"xl"} />
                </Flex>
              ) : savedPosts.length === 0 ? (
                <h1>No saved posts.</h1>
              ) : (
                savedPosts.map((post, index) => (
                  <Post
                    key={post._id || index}
                    post={post}
                    postedBy={post.postedBy}
                    videoRef={(ref) => videoRefs.current[index] = ref} // Pass ref to VideoPlayer component
                  />
                ))
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </>
  );
};

export default UserPage;
