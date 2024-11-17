import React, { useCallback, useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { Route, Routes } from 'react-router-dom'
import styled from 'styled-components'

import { Error } from 'sharedComponents'
import {
  COLORS,
  CONTENT_SPACING,
  FONT_SIZES,
  GlobalStyle,
  TRANSITION_SPEED
} from '../theme'
import { About, Home, Navigation, Photo, TitleBar } from './components'
import Gallery from './components/Gallery'
import Context from './context'

const App = () => {
  const [isNavigationVisible, setIsNavigationVisible] = useState(false)
  const toggleNavigation = useCallback(() => {
    setIsNavigationVisible(prev => !prev)
  }, [])

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
        <Route path="/private/:gallerySlug">
          <Route index element={<Gallery privateGallery={true} />} />
          <Route path=":photoId" element={<Photo privateGallery={true} />} />
        </Route>
        <Route path="/:gallerySlug">
          <Route index element={<Gallery privateGallery={false} />} />
          <Route path=":photoSlug" element={<Photo privateGallery={false} />} />
        </Route>
        <Route path="/error500" element={<Error value="500" />} />
        <Route path="*" element={<Error value="404" />} />
      </Routes>
      <NavigationWrapper $isNavigationVisible={isNavigationVisible}>
        {isNavigationVisible && <NavigationGutter onClick={toggleNavigation} />}
        <Navigation toggleNavigation={toggleNavigation} />
        <NavigationClose
          $isNavigationVisible={isNavigationVisible}
          onClick={toggleNavigation}
          size={FONT_SIZES.MEDIUM}
        />
      </NavigationWrapper>
    </>
  )
}

const NavigationClose = styled(params => <FaTimes {...params} />)`
  position: absolute;
  top: ${CONTENT_SPACING.XLARGE};
  right: ${CONTENT_SPACING.XLARGE};
  transition: opacity ${TRANSITION_SPEED}s;
  opacity: ${props => (props.$isNavigationVisible ? 1 : 0)};
  z-index: 999;
  fill: ${COLORS.BLACK};
  cursor: pointer;

  &:hover {
    fill: ${COLORS.GREEN};
  }
`

const NavigationGutter = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  z-index: 998;
`

const NavigationWrapper = styled.div<{ $isNavigationVisible: boolean }>`
  box-sizing: border-box;
  display: flex;
  position: fixed;
  z-index: 999;
  top: 0;
  overflow: scroll;
  transition: right ${TRANSITION_SPEED}s;
  right: ${({ $isNavigationVisible }) =>
    $isNavigationVisible ? '0' : '-100vw'};

  box-shadow: -1px 0px 1.5px hsl(0deg 0% 72% / 0),
    -17.4px 0px 26.1px hsl(0deg 0% 72% / 0.53);
`

const WrappedApp = () => {
  return (
    <Context>
      <App />
    </Context>
  )
}

export default WrappedApp
