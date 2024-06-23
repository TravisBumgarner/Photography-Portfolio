import React, { useMemo } from 'react'
import styled from 'styled-components'

import { Header, Text } from 'sharedComponents'

const ErrorWrapper = styled.div`
    align-items: center;
    display: flex;
    justify-content: center;
    flex-direction: column;
    margin-top: 0;
`

const Error = ({ value }: { value: '404' | '500' }) => {
  const { message, header } = useMemo(() => {
    switch (value) {
      case "404": {
        return {
          header: 'Sorry!',
          message: 'The page you were looking for was not found.'
        }
      }
      case "500": {
        return {
          header: 'Whoops!',
          message: 'Something went wrong. This error has been reported. Please try again later.'
        }
      }
    }
  }, [value])

  return (
    <ErrorWrapper>
      <Header size="medium">{header}</Header>
      <Text>{message}</Text>
    </ErrorWrapper>
  )
}

export default Error