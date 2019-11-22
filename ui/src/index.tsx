import React, { Component } from 'react'
import * as Sentry from '@sentry/browser'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import ReactDOM from 'react-dom'

import { App, Error } from './views'

Sentry.init({
    dsn: 'https://9f4ad55370e84dea97293045aab74b8b@sentry.io/1304092'
})

class SentryWrapper extends Component {
    constructor(props: any) {
        super(props)
        this.state = {
            error: null
        }
    }

    componentDidCatch(error: any, errorInfo: any) {
        this.setState({ error })
        Sentry.withScope(scope => {
            Object.keys(errorInfo).forEach((key: string) => {
                scope.setExtra(key, errorInfo[key])
            })
            Sentry.captureException(error)
        })
    }

    render() {
        if (this.state.error) {
            return <Error value="500" />
        } else {
            return this.props.children
        }
    }
}

ReactDOM.render(
    <SentryWrapper>
        <BrowserRouter>
            <Switch>
                <Route path="/" component={App} />
            </Switch>
        </BrowserRouter>
    </SentryWrapper>,
    document.getElementById('root')
)
