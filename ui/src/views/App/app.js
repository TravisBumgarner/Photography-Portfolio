import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'

import { Home } from '../../views'

import { AppWrapper } from './App.styles.js'

class App extends Component {
    render() {
        return (
            <AppWrapper>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route component={Home} />
                </Switch>
            </AppWrapper>
        )
    }
}

App.propTypes = {}

export default App
