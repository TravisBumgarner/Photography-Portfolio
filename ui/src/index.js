import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { App } from './views'

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('root')
)
