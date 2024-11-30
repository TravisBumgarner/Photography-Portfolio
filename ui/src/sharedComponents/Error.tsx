import React, { useMemo } from 'react'
import styled from 'styled-components'

import PageHeader from 'src/sharedComponents/PageHeader'
import { CONTENT_SPACING, FONT_SIZES } from 'src/theme'

const ErrorWrapper = styled.div`
  display: flex;
  margin: ${CONTENT_SPACING.LARGE};
  flex-direction: column;
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
      <PageHeader>{header}</PageHeader>
      <Text>{message}</Text>
    </ErrorWrapper>
  )
}

const Text = styled.p`
  font-size: ${FONT_SIZES.MEDIUM};
`

export default Error
