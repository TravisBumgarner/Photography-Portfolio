import React, { Component, Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import axios from 'axios'

import { Home, Contact, About, Portfolio, Blog } from 'Views'
import { Navigation, TitleBar } from 'Containers'
import { GlobalStyle } from 'Theme'

import { AppWrapper, NavigationWrapper, ContentWrapper, NavigationClose, NavigationGutter } from './App.styles.js'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            theme: {
                backgroundSrc: '',
                primaryColor: 'rgb(0,0,0)',
                secondaryColor: 'rgb(0,0,0)'
            },
            photos: [],
            isNavigationVisible: true,
            isBackgroundVisible: true,
            pathname: null,
            galleries: []
        }
    }

    componentWillMount() {
        const {
            location: { pathname }
        } = this.props

        this.setState({ pathname, isNavigationVisible: pathname === '/' })

        Promise.all([this.getPhotos(), this.getGalleries()]).then(responses => {
            this.setState({ photos: responses[0], galleries: responses[1] })
        })

        // this.getThemeDetails()
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

    // getThemeDetails = () => {
    //     console.log(__API__)
    //     axios.get(__API__ + 'get_random_photo').then(response => {
    //         const { src, color_sample_1, color_sample_2 } = response.data
    //         this.setState({
    //             theme: {
    //                 backgroundSrc: src,
    //                 primaryColor: color_sample_1,
    //                 secondaryColor: color_sample_2
    //             }
    //         })
    //     })
    // }

    getGalleries = () => {
        return axios
            .get(__API__ + 'galleries/')
            .then(({ data: galleries }) => galleries)
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
        const { galleries, photos, isLoading, theme, isNavigationVisible, isBackgroundVisible, pathname } = this.state
        return isLoading ? null : (
            <Fragment>
                <GlobalStyle theme={theme} isBackgroundVisible={isBackgroundVisible} />
                <AppWrapper>
                    <TitleBar isNavigationVisible={isNavigationVisible} toggleNavigation={this.toggleNavigation} />
                    <NavigationWrapper isNavigationVisible={isNavigationVisible}>
                        {isNavigationVisible &&
                            pathname !== '/' && <NavigationGutter onClick={this.toggleNavigation} />}
                        <Navigation
                            isNavigationVisible={isNavigationVisible}
                            galleries={galleries}
                            theme={theme}
                            toggleNavigation={this.toggleNavigation}
                        />
                        {pathname !== '/' && (
                            <NavigationClose
                                isNavigationVisible={isNavigationVisible}
                                onClick={this.toggleNavigation}
                                size="3em"
                            />
                        )}
                    </NavigationWrapper>
                    <Switch>
                        <Route exact path="/" component={Home} />
                        <Route exact path="/blog" render={rest => <Blog theme={theme} {...rest} />} />
                        <Route exact path="/contact" render={rest => <Contact theme={theme} {...rest} />} />
                        <Route exact path="/about" render={rest => <About theme={theme} {...rest} />} />
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
