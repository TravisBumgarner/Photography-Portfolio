import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import axios from 'axios'

import { Home, Contact, About, Portfolio } from 'Views'
import { Navigation } from 'Containers'

import { AppWrapper, NavigationWrapper } from './App.styles.js'

const Theme = React.createContext()

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
            photos: []
        }
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
                const metadataProjects = new Set([])

                response.data.map(photo => {
                    metadataProjects.add(photo.project.title)
                    metadataYears.add(photo.year)
                })

                this.setState({
                    isLoading: false,
                    photos: response.data,
                    visiblePhotos: response.data,
                    metadata: {
                        projects: [...metadataProjects].sort(),
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

    componentWillMount() {
        this.getThemeDetails()
        this.getPhotos()
    }

    render() {
        const { metadata, photos, isLoading, theme } = this.state
        return isLoading ? null : (
            <AppWrapper theme={theme}>
                <NavigationWrapper>
                    <Navigation metadata={metadata} theme={theme} />
                </NavigationWrapper>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route
                        exact
                        path="/contact"
                        render={rest => <Contact theme={theme} {...rest} />}
                    />
                    <Route
                        exact
                        path="/about"
                        render={rest => <About theme={theme} {...rest} />}
                    />
                    <Route
                        path="/portfolio/:projectType/:projectTitle"
                        render={rest => <Portfolio photos={photos} {...rest} />}
                    />
                </Switch>
            </AppWrapper>
        )
    }
}

App.propTypes = {}

export default App
export { Theme }
