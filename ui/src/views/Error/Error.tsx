import React from 'react'

import { Header, Text } from 'Components'

import { ErrorWrapper } from './Error.styles'


const Error404 = ({ value }: { value: '404' | '500' }) => {
    let message
    let header

    switch (value) {
        case "404":
            header = 'Sorry!'
            message = 'The page you were looking for was not found.'
            break
        default:
        case "500":
            header = 'Whoops!'
            message = 'Something went wrong. This error has been reported. Please try again later.'
            break
    }

    return (
        <ErrorWrapper>
            <Header size="medium">{header}</Header>
            <Text>{message}</Text>
        </ErrorWrapper>
    )
}

export default Error404
