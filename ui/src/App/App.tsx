import React, { useRef, useState } from 'react'
import { Routes, Route } from "react-router-dom";
import styled from "styled-components";
import { FaCaretRight } from "react-icons/fa";

import { Home, About, Portfolio, Navigation, TitleBar } from "./components";
import { Error } from "sharedComponents";
import {
  GlobalStyle,
  ICON_FONT_SIZES,
  TRANSITION_SPEED,
  ICON_COLOR,
  APP_BORDER
} from "theme";
import getData from "./content";

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

const GridContainer = styled.div`
  display: grid;
  width: 100vw;
  height: 100vh;
  padding: ${APP_BORDER};
  box-sizing: border-box;
  grid-template-columns: 100%;
  grid-template-rows:  min-content 1fr;
`;

const GridItemTitleBar = styled.div`

`
const GridItemContent = styled.div`
  box-sizing: border-box;
  overflow-x: hidden;
  width: 100%;
  height: 100%;
`

const NavigationWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  position: fixed;
  z-index: 999;
  top: 0;
  overflow: scroll;
  transition: right ${TRANSITION_SPEED}s;
  right: ${({ isNavigationVisible }: { isNavigationVisible: boolean }) =>
    isNavigationVisible ? "0" : `-100vw`};
`;

const App = (
) => {
  const { galleries, backgroundPhotos, photos } = getData();

  const [isNavigationVisible, setIsNavigationVisible] = useState(false);
  const [isTitlebarVisible, setIsTitlebarVisible] = useState(true);

  const toggleNavigation = () => {
    setIsNavigationVisible(!isNavigationVisible);
  };
  return (
    <>
      <GlobalStyle />
      <GridContainer>
        <GridItemTitleBar>
          {isTitlebarVisible ? (<TitleBar
            isNavigationVisible={isNavigationVisible}
            toggleNavigation={toggleNavigation}
          />) : ""}
        </GridItemTitleBar>
        <GridItemContent>
          <Routes>
            <Route
              path="/"
              element={<Home backgroundPhotos={backgroundPhotos} />}
            />
            <Route path="/about" element={<About />} />
            <Route path="/:gallerySlug">
              <Route index element={<Portfolio setIsTitlebarVisible={setIsTitlebarVisible} photos={photos} galleries={galleries} />} />
              <Route path=":photoId" element={<Portfolio setIsTitlebarVisible={setIsTitlebarVisible} photos={photos} galleries={galleries} />} />
            </Route>
            <Route
              path="/error500"
              element={<Error value="500" />}
            />
            <Route
              path="/error404"
              element={<Error value="404" />}
            />
            <Route element={<Error value="404" />} />
          </Routes>
        </GridItemContent>
        <NavigationWrapper isNavigationVisible={isNavigationVisible}>
          {isNavigationVisible && (
            <NavigationGutter onClick={toggleNavigation} />
          )}
          <Navigation
            galleries={galleries}
            toggleNavigation={toggleNavigation}
          />
          <NavigationClose
            isNavigationVisible={isNavigationVisible}
            onClick={toggleNavigation}
            size={ICON_FONT_SIZES.l}
          />
        </NavigationWrapper>
      </GridContainer>
    </>
  );
};

export { APP_BORDER }
export default App;
