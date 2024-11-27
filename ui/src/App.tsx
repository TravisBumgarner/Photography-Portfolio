import React, { useCallback, useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import { Error } from 'src/sharedComponents'
import { About, Home, Navigation, TitleBar } from './components'
import Gallery from './components/Gallery'
import Context from './context'
import './index.css'

const App = () => {
  const [isNavigationVisible, setIsNavigationVisible] = useState(false)
  const toggleNavigation = useCallback(() => {
    setIsNavigationVisible(prev => !prev)
  }, [])

  return (
    <>
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
