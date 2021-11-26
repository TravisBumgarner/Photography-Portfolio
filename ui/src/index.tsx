import * as React from 'react'
import * as Sentry from '@sentry/browser'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import ReactDOM from 'react-dom'

import App from './App'
import { Error } from './sharedComponents'
Sentry.init({
    dsn: 'https://9f4ad55370e84dea97293045aab74b8b@sentry.io/1304092'
})

interface IProps {
}

interface IState {
    error: ErrorEvent | null
}

class SentryWrapper extends React.Component<IProps, IState> {
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
