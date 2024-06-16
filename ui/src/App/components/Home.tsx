import React, { useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { PhotoType } from "types";
import { context } from "../context";

const HomeImageWrapper = styled.div<{ src: string }>`
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  display:flex;
  align-items: center;
  justify-content: center;
  background-image: url(${props => props.src});
  z-index: -1;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
`

const Home = () => {
  const { state: { backgroundPhotos } } = useContext(context)
  console.log(backgroundPhotos)
  const [backgroundImageIndex, setBackgroundImageIndex] = useState<number>(0);

  useEffect(() => {
    const intervalId: NodeJS.Timeout = setInterval(() => {
      setBackgroundImageIndex(prev => prev + 1)

      return () => clearInterval(intervalId)
    }, 4000)
  }, [])

  const url = useMemo(() => {
    return `https://storage.googleapis.com/photo21-asdqwd/photos/large/${encodeURIComponent(backgroundPhotos[backgroundImageIndex % backgroundPhotos.length].src)}`
  }, [backgroundImageIndex])
  return (
    <HomeImageWrapper src={url} />
  );
};

export default Home;