import React, { Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import axios from 'axios'

import { Home, About, Portfolio, Error404, Error500 } from 'Views'
import { Navigation, TitleBar } from 'Containers'
import { GlobalStyle, ICON_FONT_SIZES } from 'Theme'

import {
    AppWrapper,
    NavigationWrapper,
    NavigationClose,
    NavigationGutter,
    LoadingIcon,
    LoadingIconWrapper
} from './App.styles.js'

const App = ({location: { pathname }}) => {
    const [photos, setPhotos ] = React.useState([])
    const [galleries, setGalleries ] = React.useState([])
    const [locations, setLocations ] = React.useState([])
    const [categories, setCategories ] = React.useState([])
    const [backgroundPhotos, setBackgroundPhotos] = React.useState([])   

    const [isNavigationVisible, setIsNavigationVisible ] = React.useState(false)
    const [isbackgroundVisible, setIsbackgroundVisible ] = React.useState(true)
    const [isLoading, setIsLoading] = React.useState(true)

    const getGalleries = () => {
        return axios
            .get(__API__ + 'galleries/')
            .then(({ data: galleries }) => galleries)
            .catch(console.log)
    }

    const getLocations = () => {
        return axios
            .get(__API__ + 'locations/')
            .then(({ data: locations }) => locations)
            .catch(console.log)
    }

    const getCategories = () => {
        return axios
            .get(__API__ + 'categories/')
            .then(({ data: categories }) => categories)
            .catch(console.log)
    }

    const getPhotos = () => {
        return axios
            .get(__API__ + 'photos/')
            .then(({ data: photos }) => photos)
            .catch(console.log)
    }

    React.useEffect(() => {
        Promise.all([getPhotos(), getGalleries(), getLocations(), getCategories()]).then(
            ([photos, galleries, locations, categories]) => {
                setBackgroundPhotos(photos.filter(photo => photo.is_home_background).map(photo => photo.src))
                setPhotos(photos)
                setGalleries(galleries)
                setLocations(locations)
                setCategories(categories)
                setIsLoading(false)
            }
        )
    }, [])

    const toggleNavigation = () => {
        setIsNavigationVisible(!isNavigationVisible)
    }

    return isLoading ? (
        <LoadingIconWrapper>
            <LoadingIcon size="5em" />
        </LoadingIconWrapper>
    ) : (
        <Fragment>
            <GlobalStyle isHomepage={pathname === '/'} />
            <AppWrapper>
                <TitleBar isNavigationVisible={isNavigationVisible} toggleNavigation={toggleNavigation} />
                <NavigationWrapper isNavigationVisible={isNavigationVisible}>
                    {isNavigationVisible && <NavigationGutter onClick={toggleNavigation} />}
                    <Navigation
                        isHomepage={pathname === '/'}
                        isNavigationVisible={isNavigationVisible}
                        galleries={galleries}
                        locations={locations}
                        categories={categories}
                        toggleNavigation={toggleNavigation}
                    />
                    <NavigationClose
                        isNavigationVisible={isNavigationVisible}
                        onClick={toggleNavigation}
                        size={ICON_FONT_SIZES.l}
                    />
                </NavigationWrapper>
                <Switch>
                    <Route exact path="/" render={rest => <Home backgroundPhotos={backgroundPhotos} {...rest} />} />
                    <Route exact path="/about" render={rest => <About {...rest} />} />
                    <Route
                        path="/portfolio/:contentType/:gallerySlug/:photoId?"
                        render={rest => <Portfolio photos={photos} galleries={galleries} {...rest} />}
                    />
                    <Route path="/error500" component={Error500} />
                    <Route path="/error404" component={Error404} />
                    <Route component={Error404} />
                </Switch>
            </AppWrapper>
        </Fragment>
    )
}

export default App
export { Theme }
