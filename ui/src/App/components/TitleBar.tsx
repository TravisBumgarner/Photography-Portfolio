import React from 'react'
import styled from "styled-components";
import { FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";

import { Header } from "sharedComponents";
import { CONTENT_SPACING, ICON_FONT_SIZES, TRANSITION_SPEED, ICON_COLOR, } from "theme";

const TitleBarWrapper = styled.div<{ isTitlebarVisible: boolean }>`
  display: ${({ isTitlebarVisible }) => isTitlebarVisible ? 'flex' : 'none'};
  justify-content: space-between;
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

type Props = {
  toggleNavigation: () => void;
  isNavigationVisible: boolean;
  isTitlebarVisible: boolean;
};

const TitleBar = ({ toggleNavigation, isNavigationVisible, isTitlebarVisible }: Props) => {
  return (
    <TitleBarWrapper isTitlebarVisible={isTitlebarVisible}>
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

export default TitleBar;