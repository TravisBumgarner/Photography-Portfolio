import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import axios from 'axios'

import { Home, Contact, About } from '../../views'
import { Navigation } from '../../containers'

import { AppWrapper, NavigationWrapper } from './App.styles.js'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            src: '',
            isNavigationVisible: true,
            allPhotos: [],
            visiblePhotos: [],
            metadataYears: [],
            metadataProjects: []
        }
    }

    componentWillMount() {
        axios.get('http://localhost:8000/get_random_image').then(response => {
            this.setState({ src: response.data.src })
        })

        axios
            .get('http://localhost:8000/photos/')
            .then(response => {
                const metadataYears = new Set([])
                const metadataProjects = new Set([])

                response.data.map(photo => {
                    metadataProjects.add(photo.project)
                    metadataYears.add(photo.year)
                })

                this.setState({
                    isLoading: false,
                    allPhotos: response.data,
                    visiblePhotos: response.data,
                    metadataProjects: [...metadataProjects].sort(),
                    metadataYears: [...metadataYears].sort((a, b) => b > a)
                })
                // toggleNavigation()
            })
            .catch(error => {
                console.log(error)
                this.setState({
                    isLoading: false
                })
            })
    }

    toggleNavigation = () => {
        // this.setState({ isNavigationVisible: !this.state.isNavigationVisible })
        console.log('this should be renabled')
    }

    filterPhotosByYear = year => {
        const { allPhotos } = this.state
        const visiblePhotos = allPhotos.filter(photo => photo.year == year)
        this.setState({ visiblePhotos })
    }

    render() {
        const {
            src,
            isNavigationVisible,
            metadataProjects,
            metadataYears,
            visiblePhotos
        } = this.state

        return (
            <AppWrapper src={src} isNavigationVisible={isNavigationVisible}>
                {isNavigationVisible && (
                    <NavigationWrapper>
                        <Navigation
                            toggleNavigation={this.toggleNavigation}
                            metadataProjects={metadataProjects}
                            metadataYears={metadataYears}
                            filterPhotosByYear={this.filterPhotosByYear}
                        />
                    </NavigationWrapper>
                )}
                <Switch>
                    <Route exact path="/contact" component={Contact} />
                    <Route exact path="/about" component={About} />
                    <Route
                        exact
                        path="/"
                        render={() => (
                            <Home
                                toggleNavigation={this.toggleNavigation}
                                shouldDisplayPhotos={!isNavigationVisible}
                                photos={visiblePhotos}
                            />
                        )}
                    />
                </Switch>
            </AppWrapper>
        )
    }
}

App.propTypes = {}

export default App
