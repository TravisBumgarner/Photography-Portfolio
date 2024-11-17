import React, { useMemo } from 'react'
import styled from 'styled-components'

import { Text } from 'sharedComponents'
import { CONTENT_SPACING, FONT_SIZES } from 'theme'

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
      case '404': {
        return {
          header: 'Sorry!',
          message: 'The page you were looking for was not found.'
        }
      }
      case '500': {
        return {
          header: 'Whoops!',
          message:
            'Something went wrong. This error has been reported. Please try again later.'
        }
      }
    }
  }, [value])

  return (
    <ErrorWrapper>
      <Header>{header}</Header>
      <Text>{message}</Text>
    </ErrorWrapper>
  )
}

const Header = styled.h1`
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: ${CONTENT_SPACING.l};
  margin-top: ${CONTENT_SPACING.l};
  font-size: ${FONT_SIZES.LARGE};
`

export default Error
