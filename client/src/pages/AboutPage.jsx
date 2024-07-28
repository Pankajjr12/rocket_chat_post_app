import React from "react";
import { Box, Container, Link, Icon } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";

// Define the motion Box component for animation
const MotionBox = motion(Box);

// Define keyframe animation for color-changing effect
const flameAnimation = {
  animate: {
    color: [
      "#ff0000", // Red
      "#ff4500", // OrangeRed
      "#ff8c00", // DarkOrange
      "#ff4500", // OrangeRed
      "#ff0000", // Red
    ], // Color sequence for flame effect
    transition: {
      color: {
        duration: 1.5, // Duration for one color cycle
        repeat: Infinity, // Infinite looping
        repeatType: "loop",
        ease: "linear",
      },
    },
  },
};

const AboutPage = () => {
  return (
    <Container>
      <Box
        border="1px solid #ccc"
        p={4} // Add padding to the Box for spacing
        textAlign="left" // Align text to the left
        ml={4} // Add margin-left to create space from the left edge
      >
        Welcome to <strong>Rocket Chat Post</strong>! This dynamic app is crafted with a blend of
        powerful technologies, including React JS, MongoDB, Express, Node.js,
        and Chakra UI. We've incorporated Framer Motion for smooth animations
        and NodeMailer for seamless email functionality, ensuring a polished and
        interactive user experience. Your privacy and security are paramount to
        us, and we’ve implemented stringent measures to protect your data.
        Additionally, we utilize Cloudinary for efficient video and image
        uploads, providing a reliable and scalable cloud storage solution. The
        app is developed by <strong>Pankaj Kumar</strong>. For more details, visit the GitHub
        repository link below.
      </Box>
      <Link href="https://github.com/Pankajjr12/rocket_chat_post_app" isExternal>
        <MotionBox
          whileHover={{ scale: 1.1 }} // Scale up on hover
          whileTap={{ scale: 0.9 }}   // Scale down on click
          transition={{ duration: 0.3 }} // Animation duration
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <motion.div
            variants={flameAnimation}
            initial="animate"
            animate="animate"
          >
            <Icon
              as={FaGithub} // Use the FaGithub icon
              boxSize="150px" // Set size of the icon
              color="currentColor" // Use currentColor for smooth color changes
            />
          </motion.div>
        </MotionBox>
      </Link>
    </Container>
  );
};

export default AboutPage;
