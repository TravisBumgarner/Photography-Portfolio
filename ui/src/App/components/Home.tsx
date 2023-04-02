import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ONE_HUNDRED_VH } from "theme";

import { PhotoType } from "types";

const HomeImageWrapper = styled.div<{ src: string }>`
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  ${ONE_HUNDRED_VH}
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

type Props = {
  backgroundPhotos: PhotoType[];
};

const Home = ({ backgroundPhotos }: Props) => {
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