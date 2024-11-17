import React from 'react'
import { FaBars } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import {
  CONTENT_SPACING,
  FONT_SIZES,
  ICON_COLOR,
  ICON_FONT_SIZE,
  TRANSITION_SPEED
} from 'theme'

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
        isNavigationVisible={isNavigationVisible}
        onClick={toggleNavigation}
        size={ICON_FONT_SIZE}
      />
    </TitleBarWrapper>
  )
}

const Header = styled.h1`
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: ${CONTENT_SPACING.l};
  margin-top: ${CONTENT_SPACING.l};
  font-size: ${FONT_SIZES.MEDIUM};
`

const TitleBarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem;
`

const InternalLink = styled(Link)`
  text-decoration: none;
  color: black;

  &:visited {
    color: black;
  }
`

const NavigationOpen = styled(({ isNavigationVisible, ...rest }) => (
  <FaBars {...rest} />
))`
  fill: ${ICON_COLOR.initial};
  padding-bottom: ${CONTENT_SPACING.l};
  padding-top: ${CONTENT_SPACING.l};
  transition: opacity ${TRANSITION_SPEED}s;
  opacity: ${props => (props.isNavigationVisible ? 0 : 1)};
  cursor: pointer;
  margin-left: 1rem;

  &:hover {
    fill: ${ICON_COLOR.hover};
  }
`

export default TitleBar
