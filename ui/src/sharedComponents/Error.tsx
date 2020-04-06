import React from 'react'
import styled from 'styled-components'

import { Header, Text } from 'sharedComponents'
import { PAGE_THEME } from 'Theme'

const ErrorWrapper = styled(PAGE_THEME)`
    align-items: center;
    display: flex;
    justify-content: center;
    flex-direction: column;
    margin-top: 0;
`

const Error = ({ value }: { value: '404' | '500' }) => {
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

export default Error
