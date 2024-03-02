import React from "react";
import styled from "styled-components";

import { Text } from "sharedComponents";
import { PhotoType } from "types";

const MetadataWrapper = styled.div`
  border-radius: 0.5rem;
  margin: 0 0.25rem 0.25rem;
  padding: 0.5rem;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.7);
  height: 1.5rem;

  & > * {
    font-size: 14px;
    padding: 0;
  }
`;

const Spacer = styled(({ className }) => <span className={className}>//</span>)`
  padding: 0 20px;
  display: inline-block;
  font-weight: 700;
`;



const Metadata = ({ details }: { details: PhotoType }) => {
  const {
    camera,
    aperture,
    shutterSpeed,
    iso,
    lens,
    focalLength,
    location
  } = details;

  const gearString = `${camera} ${lens}`
  const statsString =
    aperture || shutterSpeed || iso || focalLength
      ? `${aperture} ${shutterSpeed} ${iso} ${focalLength}`
      : "N/A";

  return (
    <MetadataWrapper>
      <Text>
        <>
          {location}
          <Spacer />
          {gearString}
          <Spacer />
          {statsString}
        </>
      </Text>
    </MetadataWrapper>
  );
};

export default Metadata