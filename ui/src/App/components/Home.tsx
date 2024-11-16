import React, { useContext } from "react";
import styled from "styled-components";

import { context } from "../context";
import { getPhotoUrl } from "../utils";
import { Link } from "react-router-dom";
import { Header, LazyImage } from "sharedComponents";
import { Blurhash } from "react-blurhash";

const HomeImageWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Home = () => {
  const {
    state: { galleries, photos },
  } = useContext(context);

  return (
    <HomeImageWrapper>
      {Object.values(galleries).map(
        ({ slug, title, previewSrc, previewId }) => {
          const url = getPhotoUrl({
            isThumbnail: true,
            photoSrc: previewSrc,
            privateGalleryId: undefined,
          });
          const blurHash = photos[previewId].blurHash;

          return (
            <div key={slug}>
              <Link
                style={{
                  textDecoration: "none",
                  textAlign: "center",
                  color: "black",
                }}
                id={slug}
                to={`/${slug}`}
                
              >
                <Header size="h2">{title}</Header>
                <LazyImage url={url} blurHash={blurHash}/>
              </Link>
            </div>
          );
        }
      )}
    </HomeImageWrapper>
  );
};

export default Home;
