import React, { Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { FaCaretRight, FaCamera } from 'react-icons/fa'

import { Home, About, Portfolio, Navigation, TitleBar } from './components'
import { Error } from 'sharedComponents'
import { GlobalStyle, ICON_FONT_SIZES, TRANSITION_SPEED, ICON_COLOR } from 'Theme'
import {
    GalleryType,
    PhotoType,
    LocationType,
    CategoryType
} from 'sharedTypes'

import output from './output.json'

const NavigationClose = styled(({ isNavigationVisible, ...rest }) => <FaCaretRight {...rest} />)`
    position: absolute;
    top: 20px;
    left: 7px;
    transition: opacity ${TRANSITION_SPEED}s;
    opacity: ${props => (props.isNavigationVisible ? 1 : 0)};
    z-index: 999;
    fill: ${ICON_COLOR.initial};

    &:hover {
        fill: ${ICON_COLOR.hover};
    }
`
const colorChange = keyframes`
  0% {
    fill: #fff;
  }

  50% {
    fill: rgb(74, 207, 160);
  }

  100% {
      fill: #fff;
  }
`

const LoadingIcon = styled(FaCamera)`
    animation: ${colorChange} 2s linear infinite;
`

const LoadingIconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
`

const NavigationGutter = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    /* width 100vw;
    height 100vh; */
    z-index: 998;
`

const AppWrapper = styled.div``

const NavigationWrapper = styled.div`
    box-sizing: border-box;
    display: flex;
    position: fixed;
    z-index: 999;
    bottom: 0;
    transition: right ${TRANSITION_SPEED}s;
    right: ${({ isNavigationVisible }: { isNavigationVisible: boolean }) => (isNavigationVisible ? '0' : `-100vw`)};
`

type Props = {
    location: {
        pathname: string
    }
}

type Data = { photos: PhotoType[], galleries: GalleryType[], locations: LocationType[], categories: CategoryType[], backgroundPhotos: PhotoType[] }
const getData = (): Data => {
    const locations: LocationType[] = []
    const categories: CategoryType[] = []
    const backgroundPhotos: PhotoType[] = output.photos.filter(photo => photo.is_home_background)

    return { photos: output.photos, galleries: output.galleries, locations, categories, backgroundPhotos }
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
