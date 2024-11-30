import { ErrorBoundary, init as sentryInit } from '@sentry/react'
import React from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'

import { BrowserRouter } from 'react-router-dom'
import Error from 'src/sharedComponents/Error'

sentryInit({
  dsn: 'https://9f4ad55370e84dea97293045aab74b8b@sentry.io/1304092'
})

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
  <ErrorBoundary fallback={<Error value="500" />}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
)
