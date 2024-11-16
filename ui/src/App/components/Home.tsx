import React, { useContext } from "react";
import styled from "styled-components";

import { context } from "../context";
import { getPhotoUrl } from "../utils";
import { Link } from "react-router-dom";
import {  LazyImage } from "sharedComponents";
import { CONTENT_SPACING, FONT_FAMILY_HEADER, HEADER_FONT_SIZES } from "theme";

const HomeImageWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
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
                <LazyImage url={url} blurHash={blurHash}/>
                <Header>{title}</Header>
              </Link>
            </div>
          );
        }
      )}
    </HomeImageWrapper>
  );
};

const Header = styled.h2`
    font-weight: 700;
    font-family: ${FONT_FAMILY_HEADER};
    margin-bottom: ${CONTENT_SPACING.m};
    margin-top: ${CONTENT_SPACING.l};
    font-size: ${HEADER_FONT_SIZES.s};
    text-align: left;
`

export default Home;
