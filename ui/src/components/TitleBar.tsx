import React from 'react'
import { FaBars } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import {
  COLORS,
  CONTENT_SPACING,
  FONT_SIZES,
  TRANSITION_SPEED
} from 'src/theme'

interface Props {
  toggleNavigation: () => void
  isNavigationVisible: boolean
}

const TitleBar = ({ toggleNavigation, isNavigationVisible }: Props) => {
  return (
    <TitleBarWrapper>
      <InternalLink to="/">
        <Header>Travis Bumgarner Photography</Header>
      </InternalLink>
      <NavigationOpen
        tabIndex={0}
        role="button"
        aria-label="Open navigation"
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleNavigation()
          }
        }}
        $isNavigationVisible={isNavigationVisible}
        onClick={toggleNavigation}
        size={FONT_SIZES.LARGE}
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

const NavigationOpen = styled(params => <FaBars {...params} />)`
  fill: ${COLORS.FOREGROUND};
  transition: opacity ${TRANSITION_SPEED}s;
  opacity: ${props => (props.$isNavigationVisible ? 0 : 1)};
  cursor: pointer;

  // Push site title over a bit to avoid misclicks.
  margin-left: 4rem;

  @media (hover: hover) {
    &:hover {
      fill: ${COLORS.PRIMARY};
    }
  }
`

export default TitleBar
