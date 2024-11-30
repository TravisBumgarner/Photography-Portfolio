import { motion, useAnimationControls } from 'framer-motion'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { useSignals } from '@preact/signals-react/runtime'

import IconButton from 'src/sharedComponents/IconButton'
import {
  COLORS,
  CONTENT_SPACING,
  FONT_SIZES,
  MAX_WIDTH,
  Z_INDEX
} from 'src/theme'
import { isNavigationVisible } from './Navigation'

interface TitleBarProps {
  isPhotoSlugRoute: boolean
}

const TitleBar = ({ isPhotoSlugRoute }: TitleBarProps) => {
  useSignals()
  const controls = useAnimationControls()

  const openNavigation = () => {
    isNavigationVisible.value = true
  }
  console.log('isPhotoSlugRoute', isPhotoSlugRoute)

  useEffect(() => {
    if (isPhotoSlugRoute) {
      void controls.start('show')
    } else {
      void controls.start('hide')
    }
  }, [isPhotoSlugRoute, controls])

  return (
    <TitleBarWrapper
      animate={controls}
      transition={{ duration: 0.25 }}
      variants={{
        show: { opacity: 0 },
        hide: { opacity: 1 }
      }}
    >
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
  font-size: ${FONT_SIZES.MEDIUM};

  // This in combination with the position sticky and margin on TitleBarWrapper
  // gives a nice vertical spacing before scroll.
  padding: ${CONTENT_SPACING.LARGE} 0;

  @media (hover: hover) {
    &:hover {
      color: ${COLORS.PRIMARY};
    }
  }
`

const TitleBarWrapper = styled(motion.div)`
  z-index: ${Z_INDEX.TITLE_BAR}; // Exists to deal with stacking order of hovered images covering title.
  /* position: sticky; */
  top: 0;
  max-width: ${MAX_WIDTH};
  margin: ${CONTENT_SPACING.XLARGE} auto;

  padding: 0 ${CONTENT_SPACING.LARGE};
  background-color: ${COLORS.BACKGROUND};

  > div {
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
