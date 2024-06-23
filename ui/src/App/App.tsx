import React, { useCallback, useState } from 'react';
import { FaCaretRight } from "react-icons/fa";
import { Route, Routes } from "react-router-dom";
import styled from "styled-components";

import { Error } from "sharedComponents";
import { GlobalStyle, ICON_COLOR, ICON_FONT_SIZES, TRANSITION_SPEED } from "theme";
import { About, Home, Navigation, Portfolio, Private, TitleBar } from "./components";
import Context from './context';



const App = (
) => {
  const [isNavigationVisible, setIsNavigationVisible] = useState(false);
  const toggleNavigation = useCallback(() => setIsNavigationVisible(prev => !prev), [])

  return (
    <>
      <GlobalStyle />
      <TitleBar
        isNavigationVisible={isNavigationVisible}
        toggleNavigation={toggleNavigation}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/private/:privateGallerySlug">
          <Route index element={<Private />} />
          <Route path=":photoId" element={<Private />} />
        </Route>
        <Route path="/:gallerySlug">
          <Route index element={<Portfolio />} />
          <Route path=":photoId" element={<Portfolio />} />
        </Route>
        <Route path="/error500" element={<Error value="500" />} />
        <Route path="*" element={<Error value="404" />} />
      </Routes>
      <NavigationWrapper isNavigationVisible={isNavigationVisible}>
        {isNavigationVisible && (
          <NavigationGutter onClick={toggleNavigation} />
        )}
        <Navigation
          toggleNavigation={toggleNavigation}
        />
        <NavigationClose
          isNavigationVisible={isNavigationVisible}
          onClick={toggleNavigation}
          size={ICON_FONT_SIZES.l}
        />
      </NavigationWrapper>

    </>
  );
};


const NavigationClose = styled(({ isNavigationVisible, ...rest }) => (
  <FaCaretRight {...rest} />
))`
  position: absolute;
  top: 20px;
  left: 7px;
  transition: opacity ${TRANSITION_SPEED}s;
  opacity: ${(props) => (props.isNavigationVisible ? 1 : 0)};
  z-index: 999;
  fill: ${ICON_COLOR.initial};
  cursor: pointer;

  &:hover {
    fill: ${ICON_COLOR.hover};
  }
`;

const NavigationGutter = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  z-index: 998;
`;

const NavigationWrapper = styled.div<{ isNavigationVisible: boolean }>`
  box-sizing: border-box;
  display: flex;
  position: fixed;
  z-index: 999;
  top: 0;
  overflow: scroll;
  transition: right ${TRANSITION_SPEED}s;
  right: ${({ isNavigationVisible }) => isNavigationVisible ? "0" : `-100vw`};
`;

const WrappedApp = () => {
  return (
    <Context>
      <App />
    </Context>
  )
}

export default WrappedApp;