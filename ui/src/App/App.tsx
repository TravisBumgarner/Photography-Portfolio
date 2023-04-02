import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Routes, Route } from "react-router-dom";
import styled from "styled-components";
import { FaCaretRight } from "react-icons/fa";

import { Home, About, Portfolio, Navigation, TitleBar } from "./components";
import { Error } from "sharedComponents";
import { GlobalStyle, ICON_FONT_SIZES, TRANSITION_SPEED, ICON_COLOR, APP_BORDER } from "theme";
import getContent from "./content";

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
`;

const GridItemContent = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
`

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

const App = (
) => {
  const { galleries, backgroundPhotos, photos } = useMemo(() => getContent(), [])

  const [isNavigationVisible, setIsNavigationVisible] = useState(false);
  const [isTitlebarVisible, setIsTitlebarVisible] = useState(true);

  const toggleNavigation = useCallback(() => setIsNavigationVisible(prev => !prev), [])

  useEffect(() => {
    const documentHeight = () => {
      const doc = document.documentElement
      doc.style.setProperty('--doc-height', `${window.innerHeight}px`)
    }
    window.addEventListener('resize', documentHeight)
    documentHeight()
  }, [])


  return (
    <>
      <GlobalStyle />
      <GridContainer>
        <TitleBar
          isNavigationVisible={isNavigationVisible}
          toggleNavigation={toggleNavigation}
          isTitlebarVisible={isTitlebarVisible}
        />
        <GridItemContent>
          <Routes>
            <Route path="/" element={<Home backgroundPhotos={backgroundPhotos} />} />
            {/* <Route path="/about" element={<About />} /> */}
            <Route path="/:gallerySlug" element={<Portfolio setIsTitlebarVisible={setIsTitlebarVisible} photos={photos} galleries={galleries} />} />
            <Route path="/:gallerySlug">
              <Route index element={<Portfolio setIsTitlebarVisible={setIsTitlebarVisible} photos={photos} galleries={galleries} />} />
              <Route path=":photoId" element={<Portfolio setIsTitlebarVisible={setIsTitlebarVisible} photos={photos} galleries={galleries} />} />
            </Route>
            <Route path="/error500" element={<Error value="500" />} />
            <Route path="*" element={<Error value="404" />} />
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