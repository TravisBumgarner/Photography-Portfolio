import React from 'react'
import { ErrorBoundary, init as sentryInit } from "@sentry/react";
import { createRoot } from 'react-dom/client';
import Modal from 'react-modal';

import App from './App'

import { Error } from './sharedComponents'
import { BrowserRouter } from 'react-router-dom';

sentryInit({ dsn: 'https://9f4ad55370e84dea97293045aab74b8b@sentry.io/1304092' })

const container = document.getElementById('root');
Modal.setAppElement('#root');

const root = createRoot(container!);

root.render(
    <ErrorBoundary fallback={<Error value="500" />}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ErrorBoundary>,
)