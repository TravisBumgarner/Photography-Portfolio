import React from 'react';
import { FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { Header } from "sharedComponents";
import { CONTENT_SPACING, ICON_COLOR, ICON_FONT_SIZES, TRANSITION_SPEED, } from "theme";

type Props = {
  toggleNavigation: () => void;
  isNavigationVisible: boolean;
};

const TitleBar = ({ toggleNavigation, isNavigationVisible }: Props) => {
  return (
    <TitleBarWrapper>
      <InternalLink to="/">
        <Header size="large">Travis Bumgarner Photography</Header>
      </InternalLink>
      <NavigationOpen
        isNavigationVisible={isNavigationVisible}
        onClick={toggleNavigation}
        size={ICON_FONT_SIZES.l}
      />
    </TitleBarWrapper>
  );
};

const TitleBarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem;
`;

const InternalLink = styled(Link)`
  text-decoration: none;
  color: black;

  &:visited {
    color: black;
  }
`;

const NavigationOpen = styled(({ isNavigationVisible, ...rest }) => (
  <FaBars {...rest} />
))`
  fill: ${ICON_COLOR.initial};
  padding-bottom: ${CONTENT_SPACING.l};
  padding-top: ${CONTENT_SPACING.l};
  transition: opacity ${TRANSITION_SPEED}s;
  opacity: ${(props) => (props.isNavigationVisible ? 0 : 1)};
  cursor: pointer;

  &:hover {
    fill: ${ICON_COLOR.hover};
  }
`;

export default TitleBar;