import * as React from "react";
import styled from "styled-components";

import { useInterval } from "utilities";
import { PhotoType } from "sharedTypes";

const HomeImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  display:flex;
  align-items: center;
  justify-content: center;
`

const HomeImage = styled.img`
`;

type Props = {
  backgroundPhotos: PhotoType[];
};

const Home = ({ backgroundPhotos }: Props) => {
  const [backgroundImageIndex, setBackgroundImageIndex] = React.useState(0);

  useInterval(() => setBackgroundImageIndex(backgroundImageIndex + 1), 4000);
  return (
    <HomeImageWrapper>
      <HomeImage
        src={
          backgroundPhotos.length
            ? `https://storage.googleapis.com/photo21/photos/large/${backgroundPhotos[backgroundImageIndex % backgroundPhotos.length]
              .src
            }`
            : ""
        }
      />
    </HomeImageWrapper>
  );
};

export default Home;
