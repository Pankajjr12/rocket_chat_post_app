import React, { useRef, useState, useEffect, forwardRef } from 'react';
import { Box, Flex, IconButton, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Tooltip, Progress, Spinner } from '@chakra-ui/react';
import { MdPlayArrow, MdPause, MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import throttle from 'lodash/throttle';

const VideoPlayer = forwardRef(({ src }, ref) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleScroll = throttle(() => {
    if (videoRef.current) {
      setIsInViewport(videoRef.current.getBoundingClientRect().top < window.innerHeight);
    }
  }, 100);

  useEffect(() => {
    handleScroll(); // Initial check

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    const updateTime = () => {
      if (video) {
        setCurrentTime(video.currentTime);
        setProgressWidth((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      if (video) {
        setDuration(video.duration);
        setIsLoading(false);
      }
    };

    if (video) {
      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        video.removeEventListener('timeupdate', updateTime);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [isInViewport]);

  useEffect(() => {
    if (ref) {
      ref.current = {
        pauseVideo: () => {
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        },
      };
    }
  }, [ref]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().catch((error) => {
          console.log("Play failed:", error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (video) {
      if (!isFullscreen) {
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.mozRequestFullScreen) {
          video.mozRequestFullScreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
          video.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    }
  };

  const handleSliderChange = (value) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
      setProgressWidth((value / duration) * 100);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Box maxW="100%" borderRadius="xl" overflow="hidden">
      <Flex justifyContent="center" alignItems="center" flexDirection="column">
        <Box borderRadius="xl" overflow="hidden" mb={2} position="relative" minH="200px">
          {isLoading && (
            <Flex
              justifyContent="center"
              alignItems="center"
              position="absolute"
              top="0"
              left="0"
              w="full"
              h="full"
              bg="rgba(0, 0, 0, 0.5)"
            >
              <Spinner size="lg" color="white" />
            </Flex>
          )}
          <video
            ref={videoRef}
            src={isInViewport ? src : ''}
            onClick={togglePlay}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onCanPlay={() => setIsLoading(false)}
            style={{ maxWidth: '100%', width: '100%', height: 'auto', display: 'block' }}
          />
        </Box>

        <Flex justifyContent="center" alignItems="center" mt={2}>
          <Tooltip label={isPlaying ? 'Pause' : 'Play'}>
            <IconButton
              icon={isPlaying ? <MdPause /> : <MdPlayArrow />}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              variant="ghost"
              size="lg"
            />
          </Tooltip>

          <Box flex="1" mx={4}>
            <Slider
              aria-label="video-slider"
              value={currentTime}
              max={duration || 1}
              onChange={handleSliderChange}
              onMouseUp={(e) => handleSliderChange(e.target.value)}
            >
              <SliderTrack bg="gray.300">
                <SliderFilledTrack bg="blue.500" />
                <SliderThumb boxSize={6} />
              </SliderTrack>
            </Slider>
          </Box>

          <Box color="gray.400" minW="40px" textAlign="right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </Box>

          <Tooltip label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <IconButton
              icon={isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              variant="ghost"
              size="lg"
              ml={4}
            />
          </Tooltip>
        </Flex>

        <Box w="90%" my={2}>
          <Progress value={progressWidth} height="4px" />
        </Box>
      </Flex>
    </Box>
  );
});

export default VideoPlayer;
