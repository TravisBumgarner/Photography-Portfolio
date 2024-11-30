import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import React, { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import Error from 'src/sharedComponents/Error'
import styled from 'styled-components'
import './index.css'
import Loading from './sharedComponents/Loading'
import { SHARED_ANIMATION_DURATION } from './sharedComponents/NavigationAnimation'
import { COLORS, CONTENT_SPACING, MAX_WIDTH } from './theme'

const SinglePhoto = lazy(async () => await import('./components/SinglePhoto'))
const About = lazy(async () => await import('./components/About'))
const Home = lazy(async () => await import('./components/Home'))
const Navigation = lazy(async () => await import('./components/Navigation'))
const TitleBar = lazy(async () => await import('./components/TitleBar'))
const Gallery = lazy(async () => await import('./components/Gallery'))

const App = () => {
  const location = useLocation()
  const controls = useAnimationControls()
  const isPhotoSlugRoute =
    location.pathname.includes('/gallery/') &&
    location.pathname.split('/').length > 3

  useEffect(() => {
    if (isPhotoSlugRoute) {
      void controls.start('darkenBackground')
    } else {
      void controls.start('lightenBackground')
    }
  }, [isPhotoSlugRoute, controls])

  return (
    <Background
      animate={controls}
      transition={{
        duration: SHARED_ANIMATION_DURATION,
        delay: SHARED_ANIMATION_DURATION
      }}
      variants={{
        darkenBackground: {
          backgroundColor: COLORS.FOREGROUND
        },
        lightenBackground: {
          backgroundColor: COLORS.BACKGROUND
        }
      }}
    >
      <AppContainer>
        <Navigation />
        <TitleBar isPhotoSlugRoute={isPhotoSlugRoute} />
        <Suspense fallback={<Loading />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/gallery/:gallerySlug">
                <Route index element={<Gallery />} />
                <Route path=":photoSlug" element={<SinglePhoto />} />
              </Route>
              <Route path="/error500" element={<Error value="500" />} />
              <Route path="*" element={<Error value="404" />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </AppContainer>
    </Background>
  )
}

const Background = styled(motion.div)`
  box-sizing: border-box;
  min-height: 100vh;
  padding: ${CONTENT_SPACING.XLARGE};
  @media (max-width: 768px) {
    padding: ${CONTENT_SPACING.LARGE};
  }
`

const AppContainer = styled.div`
  max-width: ${MAX_WIDTH};
  margin: 0 auto;
`

export default App
