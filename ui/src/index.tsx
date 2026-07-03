import posthog from 'posthog-js'
import { PostHogErrorBoundary, PostHogProvider } from 'posthog-js/react'
import React from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'

import { BrowserRouter } from 'react-router-dom'
import ErrorView from 'src/sharedComponents/Error'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com'

// Analytics + error tracking only run in production builds.
if (import.meta.env.PROD && POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: 'history_change',
    capture_exceptions: true
  })
}

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
  <PostHogProvider client={posthog}>
    <PostHogErrorBoundary fallback={<ErrorView value="500" />}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PostHogErrorBoundary>
  </PostHogProvider>
)
