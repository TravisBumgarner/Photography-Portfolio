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
            isNavigationVisible: true,
            isBackgroundVisible: true,
            pathname: null,
            galleries: [],
            locations: [],
            categories: []
        }
    }

    componentWillMount() {
        const {
            location: { pathname }
        } = this.props

        this.setState({ pathname, isNavigationVisible: pathname === '/' })

        Promise.all([this.getPhotos(), this.getGalleries(), this.getLocations(), this.getCategories()]).then(
            responses => {
                this.setState({
                    photos: responses[0],
                    galleries: responses[1],
                    locations: responses[2],
                    categories: responses[3]
                })
            }
        )
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
        if (nextPathname === '/') {
            statePatch.isNavigationVisible = true
        }
        this.setState({ ...statePatch })
    }

    getGalleries = () => {
        return axios
            .get(__API__ + 'galleries/')
            .then(({ data: galleries }) => galleries)
            .catch(error => console.log(error))
    }

    getLocations = () => {
        return axios
            .get(__API__ + 'locations/')
            .then(({ data: locations }) => locations)
            .catch(error => console.log(error))
    }

    getCategories = () => {
        return axios
            .get(__API__ + 'categories/')
            .then(({ data: categories }) => categories)
            .catch(error => console.log(error))
    }

    getPhotos = () => {
        return axios
            .get(__API__ + 'photos/')
            .then(({ data: photos }) => photos)
            .catch(error => console.log(error))
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
            categories
        } = this.state
        return isLoading ? null : (
            <Fragment>
                <GlobalStyle isBackgroundVisible={isBackgroundVisible} />
                <AppWrapper>
                    <TitleBar isNavigationVisible={isNavigationVisible} toggleNavigation={this.toggleNavigation} />
                    <NavigationWrapper isNavigationVisible={isNavigationVisible}>
                        {isNavigationVisible &&
                            pathname !== '/' && <NavigationGutter onClick={this.toggleNavigation} />}
                        <Navigation
                            isNavigationVisible={isNavigationVisible}
                            galleries={galleries}
                            locations={locations}
                            categories={categories}
                            toggleNavigation={this.toggleNavigation}
                        />
                        {pathname !== '/' && (
                            <NavigationClose
                                isNavigationVisible={isNavigationVisible}
                                onClick={this.toggleNavigation}
                                size={ICON_FONT_SIZES.l}
                            />
                        )}
                    </NavigationWrapper>
                    <Switch>
                        <Route exact path="/" component={Home} />
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
