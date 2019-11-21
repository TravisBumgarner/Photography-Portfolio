import React, { Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import axios from 'axios'

import { Home, About, Portfolio, Error } from 'Views'
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

import {
    Gallery,
    Photo,
    Location,
    Category
} from './App.types'

type Props = {
    location: {
        pathname: string
    }
}

const App = ({ location: { pathname } }: Props) => {
    const [photos, setPhotos] = React.useState<Photo[]>([])
    const [galleries, setGalleries] = React.useState<Gallery[]>([])
    const [locations, setLocations] = React.useState<Location[]>([])
    const [categories, setCategories] = React.useState<Category[]>([])
    const [backgroundPhotos, setBackgroundPhotos] = React.useState<Photo[]>([])

    const [isNavigationVisible, setIsNavigationVisible] = React.useState(false)
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
            (
                [photos, galleries, locations, categories]:
                    [Photo[], Gallery[], Location[], Category[]]
            ) => {
                setBackgroundPhotos(photos.filter(photo => photo.is_home_background))
                setPhotos(photos)
                setGalleries(galleries)
                setLocations(locations)s
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
                <GlobalStyle />
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
                        <Route path="/error500" render={rest => <Error value="500" {...rest} />} />
                        <Route path="/error404" render={rest => <Error value="404" {...rest} />} />
                        <Route render={rest => <Error value="404" {...rest} />} />
                    </Switch>
                </AppWrapper>
            </Fragment>
        )
}

export default App
