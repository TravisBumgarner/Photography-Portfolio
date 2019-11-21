import React from 'react'

import { Header, Text } from 'Components'

import { Error500Wrapper } from './Error500.styles.js'

const Error404 = () => {
    return (
        <Error500Wrapper>
            <Header size="medium">Whoops!</Header>
            <Text>Something went wrong. This error has been reported. Please try again later.</Text>
        </Error500Wrapper>
    )
}

export default Error404
