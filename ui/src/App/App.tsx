import * as React from "react";
import { Switch, Route } from "react-router-dom";
import styled from "styled-components";
import { FaCaretRight } from "react-icons/fa";

import { Home, About, Portfolio, Navigation, TitleBar } from "./components";
import { Error } from "sharedComponents";
import {
  GlobalStyle,
  ICON_FONT_SIZES,
  TRANSITION_SPEED,
  ICON_COLOR,
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
  padding: 10px;
  box-sizing: border-box;
  grid-template-columns: 100%;
  grid-template-rows:  min-content 1fr;
`;

const GridItemTitleBar = styled.div`

`
const GridItemContent = styled.div`
  box-sizing: border-box;
  /* overflow-y: hidden; */
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

const App = () => {
  const { galleries, backgroundPhotos, photos } = getData();

  const [isNavigationVisible, setIsNavigationVisible] = React.useState(false);

  const toggleNavigation = () => {
    setIsNavigationVisible(!isNavigationVisible);
  };

  return (
    <>
      <GlobalStyle />
      <GridContainer>
        <GridItemTitleBar>
          <TitleBar
            isNavigationVisible={isNavigationVisible}
            toggleNavigation={toggleNavigation}
          />
        </GridItemTitleBar>
        <GridItemContent>
          <Switch>
            <Route
              exact
              path="/"
              render={(rest) => (
                <Home backgroundPhotos={backgroundPhotos} {...rest} />
              )}
            />
            <Route exact path="/about" component={About} />
            <Route
              path="/portfolio/:contentType/:gallerySlug/:photoIdFromUrl?"
              render={(rest) => (
                <Portfolio photos={photos} galleries={galleries} {...rest} />
              )}
            />
            <Route
              path="/error500"
              render={(rest) => <Error value="500" {...rest} />}
            />
            <Route
              path="/error404"
              render={(rest) => <Error value="404" {...rest} />}
            />
            <Route render={(rest) => <Error value="404" {...rest} />} />
          </Switch>
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

export default App;
