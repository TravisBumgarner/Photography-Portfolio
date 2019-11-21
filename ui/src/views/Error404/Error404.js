import React from 'react'

import { Header, Text } from 'Components'

import { Error404Wrapper } from './Error404.styles.js'

const Error404 = () => {
    return (
        <Error404Wrapper>
            <Header size="medium">Whoops!</Header>
            <Text>The page you were looking for was not found.</Text>
        </Error404Wrapper>
    )
}

export default Error404
