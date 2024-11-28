import React, { Suspense, lazy, useCallback, useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import { Error } from 'src/sharedComponents'
import Context from './context'
import './index.css'

const About = lazy(async () => await import('./components/About'))
const Home = lazy(async () => await import('./components/Home'))
const Navigation = lazy(async () => await import('./components/Navigation'))
const TitleBar = lazy(async () => await import('./components/TitleBar'))
const Gallery = lazy(async () => await import('./components/Gallery'))

const App = () => {
  const [isNavigationVisible, setIsNavigationVisible] = useState(false)
  const toggleNavigation = useCallback(() => {
    setIsNavigationVisible(prev => !prev)
  }, [])

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <TitleBar
          isNavigationVisible={isNavigationVisible}
          toggleNavigation={toggleNavigation}
        />
        <Navigation
          isNavigationVisible={isNavigationVisible}
          toggleNavigation={toggleNavigation}
        />
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
    </>
  )
}

const WrappedApp = () => {
  return (
    <Context>
      <App />
    </Context>
  )
}

export default WrappedApp
