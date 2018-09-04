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
            isNavigationVisible: true
        }
    }

    componentWillMount() {
        axios.get('http://localhost:8000/get_random_image').then(response => {
            this.setState({ src: response.data.src })
        })
    }

    toggleNavigation = () => {
        this.setState({ isNavigationVisible: !this.state.isNavigationVisible })
    }

    render() {
        const { src, isNavigationVisible } = this.state
        console.log(src)
        return (
            <AppWrapper src={src} isNavigationVisible={isNavigationVisible}>
                {isNavigationVisible && (
                    <NavigationWrapper>
                        <Navigation toggleNavigation={this.toggleNavigation} />
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
                                shouldDisplayImages={!isNavigationVisible}
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
