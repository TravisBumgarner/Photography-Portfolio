import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { PhotoType } from "types";

const HomeImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display:flex;
  align-items: center;
  justify-content: center;
`

const HomeImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  display: flex;
  justify-content: center;
`;

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

  return (
    <HomeImageWrapper>
      <HomeImage
        src={
          backgroundPhotos.length
            ? `https://storage.googleapis.com/photo21-asdqwd/photos/large/${backgroundPhotos[backgroundImageIndex % backgroundPhotos.length]
              .src
            }`
            : ""
        }
      />
    </HomeImageWrapper>
  );
};

export default Home;