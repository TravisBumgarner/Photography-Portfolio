import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { useSignals } from '@preact/signals-react/runtime'
import { IconButton } from 'src/sharedComponents'
import { COLORS, CONTENT_SPACING, FONT_SIZES } from 'src/theme'
import { isNavigationVisible } from './Navigation'

const TitleBar = () => {
  useSignals()

  const openNavigation = () => {
    console.log(isNavigationVisible.value)
    isNavigationVisible.value = true
    console.log(isNavigationVisible.value)
  }

  return (
    <TitleBarWrapper>
      <InternalLink to="/">
        <Header>Travis Bumgarner Photography</Header>
      </InternalLink>

      <IconButton
        icon="menu"
        ariaLabel="Open navigation"
        onClick={openNavigation}
        size="LARGE"
      />
    </TitleBarWrapper>
  )
}

const Header = styled.h1`
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: ${CONTENT_SPACING.LARGE};
  margin-top: ${CONTENT_SPACING.LARGE};
  font-size: ${FONT_SIZES.MEDIUM};

  @media (hover: hover) {
    &:hover {
      color: ${COLORS.PRIMARY};
    }
  }
`

const TitleBarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: ${CONTENT_SPACING.LARGE};
`

const InternalLink = styled(Link)`
  text-decoration: none;
  color: ${COLORS.BACKGROUND};

  &:visited {
    color: ${COLORS.BACKGROUND};
  }
`

export default TitleBar
