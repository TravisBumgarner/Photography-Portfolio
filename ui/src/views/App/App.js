import React, { Component, Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import axios from 'axios'

import { Home, Contact, About, Portfolio, Blog } from 'Views'
import { Navigation, TitleBar } from 'Containers'
import { GlobalStyle, ICON_FONT_SIZES } from 'Theme'

import { AppWrapper, NavigationWrapper, NavigationClose, NavigationGutter } from './App.styles.js'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            photos: [],
            isNavigationVisible: false,
            isBackgroundVisible: true,
            pathname: null,
            galleries: [],
            locations: [],
            categories: [],
            backgroundImages: []
        }
    }

    componentWillMount() {
        const {
            location: { pathname }
        } = this.props

        this.setState({
            pathname
            // isNavigationVisible: pathname === '/'
        })

        Promise.all([
            this.getPhotos(),
            this.getGalleries(),
            this.getLocations(),
            this.getCategories(),
            this.getBackgroundImages()
        ]).then(responses => {
            this.setState({
                photos: responses[0],
                galleries: responses[1],
                locations: responses[2],
                categories: responses[3],
                backgroundImages: responses[4]
            })
        })
    }

    componentWillReceiveProps(nextProps) {
        const { pathname } = this.state
        const {
            location: { pathname: nextPathname }
        } = nextProps

        let statePatch = {}
        if (pathname !== nextPathname) {
            statePatch.pathname = nextPathname
        }
        // if (nextPathname === '/') {
        //     statePatch.isNavigationVisible = true
        // }
        this.setState({ ...statePatch })
    }

    getGalleries = () => {
        return axios
            .get(__API__ + 'galleries/')
            .then(({ data: galleries }) => galleries)
            .catch(error => [])
    }

    getLocations = () => {
        return axios
            .get(__API__ + 'locations/')
            .then(({ data: locations }) => locations)
            .catch(error => [])
    }

    getCategories = () => {
        return axios
            .get(__API__ + 'categories/')
            .then(({ data: categories }) => categories)
            .catch(error => [])
    }

    getPhotos = () => {
        return axios
            .get(__API__ + 'photos/')
            .then(({ data: photos }) => photos)
            .catch(error => [])
    }

    getBackgroundImages = () => {
        return [
            'http://localhost:8000/media/full/2017/2017_Alaska_368.jpg',
            'http://localhost:8000/media/full/Architecture%20of%20Mexico/2015_San_Cristobal_-_Projects_209.jpg',
            'http://localhost:8000/media/full/Architecture%20of%20Mexico/2015_San_Cristobal_-_Projects_220.jpg'
        ]
    }

    toggleNavigation = () => {
        this.setState({ isNavigationVisible: !this.state.isNavigationVisible })
    }

    render() {
        const {
            galleries,
            photos,
            isLoading,
            isNavigationVisible,
            isBackgroundVisible,
            pathname,
            locations,
            categories,
            backgroundImages
        } = this.state

        console.log(isNavigationVisible)
        return isLoading ? null : (
            <Fragment>
                <GlobalStyle isHomepage={pathname === '/'} />
                <AppWrapper>
                    <TitleBar isNavigationVisible={isNavigationVisible} toggleNavigation={this.toggleNavigation} />
                    <NavigationWrapper isNavigationVisible={isNavigationVisible}>
                        {isNavigationVisible && <NavigationGutter onClick={this.toggleNavigation} />}
                        <Navigation
                            isHomepage={pathname === '/'}
                            isNavigationVisible={isNavigationVisible}
                            galleries={galleries}
                            locations={locations}
                            categories={categories}
                            toggleNavigation={this.toggleNavigation}
                        />
                        <NavigationClose
                            isNavigationVisible={isNavigationVisible}
                            onClick={this.toggleNavigation}
                            size={ICON_FONT_SIZES.l}
                        />
                    </NavigationWrapper>
                    <Switch>
                        <Route exact path="/" render={rest => <Home backgroundImages={backgroundImages} {...rest} />} />
                        <Route exact path="/blog" render={rest => <Blog {...rest} />} />
                        <Route exact path="/contact" render={rest => <Contact {...rest} />} />
                        <Route exact path="/about" render={rest => <About {...rest} />} />
                        <Route
                            path="/portfolio/:contentType/:galleryId"
                            render={rest => <Portfolio photos={photos} galleries={galleries} {...rest} />}
                        />
                    </Switch>
                </AppWrapper>
            </Fragment>
        )
    }
}

export default App
export { Theme }
