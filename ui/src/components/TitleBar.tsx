import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { IconButton } from 'src/sharedComponents'
import { COLORS, CONTENT_SPACING, FONT_SIZES } from 'src/theme'

interface Props {
  toggleNavigation: () => void
  isNavigationVisible: boolean
}

const TitleBar = ({ toggleNavigation }: Props) => {
  return (
    <TitleBarWrapper>
      <InternalLink to="/">
        <Header>Travis Bumgarner Photography</Header>
      </InternalLink>

      <IconButton
        icon="menu"
        ariaLabel="Open navigation"
        onClick={toggleNavigation}
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
