import React, { cloneElement } from 'react'
import {
  FaArrowLeft,
  FaArrowRight,
  FaBars,
  FaDownload,
  FaTimes
} from 'react-icons/fa'
import {
  COLORS,
  CONTENT_SPACING,
  FONT_SIZES,
  TRANSITION_SPEED
} from 'src/theme'
import styled, { css } from 'styled-components'

const IconCSS = css`
  fill: ${COLORS.FOREGROUND};
  cursor: pointer;
  margin: 0 ${CONTENT_SPACING.MEDIUM};

  @media (hover: hover) {
    &:hover {
      fill: ${COLORS.PRIMARY};
    }
  }
`

const StyledFaTimes = styled(FaTimes)`
  ${IconCSS}
`

const StyledFaArrowLeft = styled(FaArrowLeft)`
  ${IconCSS}
`

const StyledFaArrowRight = styled(FaArrowRight)`
  ${IconCSS}
`

const StyledFaBars = styled(FaBars)`
  ${IconCSS}
`

const StyledFaDownload = styled(FaDownload)`
  ${IconCSS}
`

const iconLookup = {
  close: <StyledFaTimes />,
  arrowLeft: <StyledFaArrowLeft />,
  arrowRight: <StyledFaArrowRight />,
  menu: <StyledFaBars />,
  download: <StyledFaDownload />
}

interface IconButtonProps {
  icon: keyof typeof iconLookup
  size: keyof typeof FONT_SIZES
  onClick: () => void
  ariaLabel: string
  tabIndex?: number
  role?: string
}

const IconButton = ({
  icon,
  onClick,
  ariaLabel,
  tabIndex = 0,
  role = 'button',
  size
}: IconButtonProps) => {
  return (
    <Button
      onClick={onClick}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      role={role}
    >
      {cloneElement(iconLookup[icon], { size: FONT_SIZES[size], css: IconCSS })}
    </Button>
  )
}

const Button = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  fill: ${COLORS.FOREGROUND};
  transition: fill ${TRANSITION_SPEED}s;

  @media (hover: hover) {
    &:hover {
      fill: ${COLORS.PRIMARY};
    }
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.PRIMARY};
    outline-offset: 2px;
  }
`

export default IconButton
