import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { useSignals } from '@preact/signals-react/runtime'
import { IconButton } from 'src/sharedComponents'
import {
  COLORS,
  CONTENT_SPACING,
  FONT_SIZES,
  MAX_WIDTH,
  MOBILE_WIDTH,
  Z_INDEX
} from 'src/theme'
import { isNavigationVisible } from './Navigation'

const TitleBar = () => {
  useSignals()

  const openNavigation = () => {
    isNavigationVisible.value = true
  }

  return (
    <TitleBarWrapper>
      <div>
        <InternalLink to="/">
          <Header>Travis Bumgarner Photography</Header>
        </InternalLink>

        <IconButton
          icon="menu"
          ariaLabel="Open navigation"
          onClick={openNavigation}
          size="LARGE"
        />
      </div>
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

export const TITLE_BAR_HEIGHT_DESKTOP = '60px'
export const TITLE_BAR_HEIGHT_MOBILE = '75px'

const TitleBarWrapper = styled.div`
  z-index: ${Z_INDEX.TITLE_BAR}; // Exists to deal with stacking order of hovered images covering title.

  position: fixed;
  height: ${TITLE_BAR_HEIGHT_DESKTOP};
  left: 0;
  top: 0;
  right: 0;

  // Start CSS that's same as index.css
  margin-left: 4rem;
  margin-right: 4rem;
  @media (max-width: 768px) {
    margin: 0rem;
  }
  // end

  padding: 0 ${CONTENT_SPACING.LARGE};
  background-color: ${COLORS.BACKGROUND};

  @media (max-width: ${MOBILE_WIDTH}) {
    height: ${TITLE_BAR_HEIGHT_MOBILE};
  }

  > div {
    max-width: ${MAX_WIDTH};
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
  }
`

const InternalLink = styled(Link)`
  text-decoration: none;
  color: ${COLORS.BACKGROUND};

  &:visited {
    color: ${COLORS.BACKGROUND};
  }
`

export default TitleBar
