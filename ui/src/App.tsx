import React, { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

import { motion } from 'framer-motion'
import { Error } from 'src/sharedComponents'
import styled from 'styled-components'
import Context from './context'
import './index.css'
import Loading from './sharedComponents/Loading'
import { MAX_WIDTH } from './theme'

const About = lazy(async () => await import('./components/About'))
const Home = lazy(async () => await import('./components/Home'))
const Navigation = lazy(async () => await import('./components/Navigation'))
const TitleBar = lazy(async () => await import('./components/TitleBar'))
const Gallery = lazy(async () => await import('./components/Gallery'))

const App = () => {
  return (
    <AppContainer animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <TitleBar />
      <Context>
        <Navigation />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/private/:gallerySlug">
              <Route index element={<Gallery privateGallery={true} />} />
              <Route
                path=":photoSlug"
                element={<Gallery privateGallery={true} />}
              />
            </Route>
            <Route path="/:gallerySlug">
              <Route index element={<Gallery privateGallery={false} />} />
              <Route
                path=":photoSlug"
                element={<Gallery privateGallery={false} />}
              />
            </Route>
            <Route path="/error500" element={<Error value="500" />} />
            <Route path="*" element={<Error value="404" />} />
          </Routes>
        </Suspense>
      </Context>
    </AppContainer>
  )
}

const AppContainer = styled(motion.div)`
  max-width: ${MAX_WIDTH};
  margin: 0 auto;
  opacity: 0;
`

export default App
