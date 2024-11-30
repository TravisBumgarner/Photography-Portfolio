import { AnimatePresence } from 'framer-motion'
import React, { Suspense, lazy } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import Error from 'src/sharedComponents/Error'
import styled from 'styled-components'
import './index.css'
import Loading from './sharedComponents/Loading'
import { MAX_WIDTH } from './theme'

const SinglePhoto = lazy(async () => await import('./components/SinglePhoto'))
const About = lazy(async () => await import('./components/About'))
const Home = lazy(async () => await import('./components/Home'))
const Navigation = lazy(async () => await import('./components/Navigation'))
const TitleBar = lazy(async () => await import('./components/TitleBar'))
const Gallery = lazy(async () => await import('./components/Gallery'))

const App = () => {
  const location = useLocation()
  
  return (
    <AppContainer>
      <TitleBar />
      <Navigation />
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
  )
}

const AppContainer = styled.div`
  max-width: ${MAX_WIDTH};
  margin: 0 auto;
`

export default App
