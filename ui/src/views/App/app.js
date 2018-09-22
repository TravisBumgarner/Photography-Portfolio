import React, { Component, Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import axios from 'axios'

import { Home, Contact, About, Portfolio, Blog } from 'Views'
import { Navigation } from 'Containers'
import { GlobalStyle } from 'Theme'

import { AppWrapper, NavigationWrapper, ContentWrapper, NavigationToggle } from './App.styles.js'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            theme: {
                backgroundSrc: '',
                primaryColor: 'rgb(0,0,0)',
                secondaryColor: 'rgb(0,0,0)'
            },
            metadata: {
                years: [],
                projects: []
            },
            photos: [],
            isNavigationVisible: true,
            isBackgroundVisible: true
        }
    }

    componentWillMount() {
        this.getThemeDetails()
        this.getPhotos()
    }

    getThemeDetails = () => {
        axios.get('http://localhost:8000/get_random_photo').then(response => {
            const { src, color_sample_1, color_sample_2 } = response.data
            this.setState({
                theme: {
                    backgroundSrc: src,
                    primaryColor: color_sample_1,
                    secondaryColor: color_sample_2
                }
            })
        })
    }

    getPhotos = () => {
        axios
            .get('http://localhost:8000/photos/')
            .then(response => {
                const metadataYears = new Set([])
                const metadataProjects = {}

                response.data.map(photo => {
                    metadataProjects[photo.project.id] = photo.project.title
                    metadataYears.add(photo.year)
                })

                this.setState({
                    isLoading: false,
                    photos: response.data,
                    visiblePhotos: response.data,
                    metadata: {
                        projects: { ...metadataProjects },
                        years: [...metadataYears].sort((a, b) => b > a)
                    }
                })
            })
            .catch(error => {
                console.log(error)
                this.setState({
                    isLoading: false
                })
            })
    }

    toggleNavigation = () => {
        this.setState({ isNavigationVisible: !this.state.isNavigationVisible })
    }

    render() {
        const { metadata, photos, isLoading, theme, isNavigationVisible, isBackgroundVisible } = this.state
        return isLoading ? null : (
            <Fragment>
                <GlobalStyle theme={theme} isBackgroundVisible={isBackgroundVisible} />
                <AppWrapper>
                    <NavigationWrapper isNavigationVisible={isNavigationVisible}>
                        <Navigation metadata={metadata} theme={theme} toggleNavigation={this.toggleNavigation} />
                        <NavigationToggle
                            isNavigationVisible={isNavigationVisible}
                            onClick={this.toggleNavigation}
                            size="2em"
                        />
                    </NavigationWrapper>
                    <ContentWrapper isNavigationVisible={isNavigationVisible}>
                        <Switch>
                            <Route exact path="/" component={Home} />
                            <Route exact path="/blog" render={rest => <Blog theme={theme} {...rest} />} />
                            <Route exact path="/contact" render={rest => <Contact theme={theme} {...rest} />} />
                            <Route exact path="/about" render={rest => <About theme={theme} {...rest} />} />
                            <Route
                                path="/portfolio/:projectType/:projectTitle"
                                render={rest => <Portfolio photos={photos} {...rest} />}
                            />
                        </Switch>
                    </ContentWrapper>
                </AppWrapper>
            </Fragment>
        )
    }
}

App.propTypes = {}

export default App
export { Theme }
