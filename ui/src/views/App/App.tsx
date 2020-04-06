import React, { Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import axios from 'axios'

import { Home, About, Portfolio, Error } from 'Views'
import { Navigation, TitleBar } from 'Containers'
import { GlobalStyle, ICON_FONT_SIZES } from 'Theme'

import photos from './photos.json'
import galleries from './galleries.json'

import {
    AppWrapper,
    NavigationWrapper,
    NavigationClose,
    NavigationGutter,
    LoadingIcon,
    LoadingIconWrapper
} from './App.styles'

import {
    GalleryType,
    PhotoType,
    LocationType,
    CategoryType
} from './App.types'

type Props = {
    location: {
        pathname: string
    }
}

type Data = { photos: PhotoType[], galleries: GalleryType[], locations: LocationType[], categories: CategoryType[], backgroundPhotos: PhotoType[] }
const getData = (): Data => {
    const locations: LocationType[] = []
    const categories: CategoryType[] = []
    const backgroundPhotos: PhotoType[] = []

    return { photos, galleries, locations, categories, backgroundPhotos }
}

const App = ({ location: { pathname } }: Props) => {
    const { galleries, locations, categories, backgroundPhotos, photos } = getData()

    const [isNavigationVisible, setIsNavigationVisible] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

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
                            galleries={galleries}
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
                        <Route exact path="/about" component={About} />
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
