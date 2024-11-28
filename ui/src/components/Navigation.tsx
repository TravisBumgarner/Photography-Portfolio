import React, { useContext, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { context } from 'src/context'
import usePreventAppScroll from 'src/hooks/usePreventAppScroll'
import { IconButton } from 'src/sharedComponents'
import {
  COLORS,
  CONTENT_SPACING,
  FONT_SIZES,
  TRANSITION_SPEED
} from 'src/theme'
import { focusFirstSiteElement } from 'src/utils'

interface Props {
  toggleNavigation: () => void
  isNavigationVisible: boolean
}

const ABOUT_CONTENT = [
  {
    title: 'Store',
    route: 'https://travisbumgarner.darkroom.com/',
    external: true
  },
  {
    title: 'Instagram',
    route: 'https://www.instagram.com/cameracoffeewander/',
    external: true
  },
  {
    title: 'Recognition',
    route: '/about',
    external: false
  },
  {
    title: 'Contact',
    route: 'https://www.linkedin.com/in/travisbumgarner/',
    external: true
  }
]

const MISC_CONTENT = [
  {
    title: 'Silly Side Projects',
    route: 'https://sillysideprojects.com/',
    external: true
  },
  {
    title: 'Engineering & Blog',
    route: 'https://travisbumgarner.com/',
    external: true
  }
]

const Navigation = ({ toggleNavigation, isNavigationVisible }: Props) => {
  const navigationRef = useRef<HTMLDivElement>(null)
  usePreventAppScroll(isNavigationVisible)

  const {
    state: { galleries }
  } = useContext(context)

  const links = useMemo(() => {
    return Object.values(galleries)
      .sort((a, b) => (a.title > b.title ? 1 : -1))
      .map(({ title, slug }) => {
        return (
          <LinkListItem key={slug} onClick={toggleNavigation}>
            <InternalLink to={`/${slug}`}>{title}</InternalLink>
          </LinkListItem>
        )
      })
  }, [galleries, toggleNavigation])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === 'Escape' && isNavigationVisible) {
        toggleNavigation()
        return
      }

      // Only handle Tab key if navigation is visible
      if (!isNavigationVisible || !navigationRef.current) return

      if (event.key === 'Tab') {
        const focusableElements = navigationRef.current.querySelectorAll(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        )

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isNavigationVisible, toggleNavigation])

  // Set focus on the first gallery link when the navigation is visible
  // Clear focus when the navigation is hidden
  useEffect(() => {
    if (isNavigationVisible && navigationRef.current) {
      const firstGalleryLink = navigationRef.current.querySelector('a')
      firstGalleryLink?.focus()
    } else {
      focusFirstSiteElement()
    }
  }, [isNavigationVisible])

  const aboutLinks = ABOUT_CONTENT.map(m => {
    return (
      <LinkListItem key={m.title} onClick={toggleNavigation}>
        <ExternalLink
          target={m.external ? '_blank' : ''}
          href={m.route}
          rel={m.external ? 'noopener noreferrer' : undefined}
        >
          {m.title}
          {m.external && <VisuallyHidden>(opens in new tab)</VisuallyHidden>}
        </ExternalLink>
      </LinkListItem>
    )
  })

  const miscLinks = MISC_CONTENT.map(m => {
    return (
      <LinkListItem key={m.title} onClick={toggleNavigation}>
        <ExternalLink
          target={m.external ? '_blank' : ''}
          href={m.route}
          rel={m.external ? 'noopener noreferrer' : undefined}
        >
          {m.title}
          {m.external && <VisuallyHidden>(opens in new tab)</VisuallyHidden>}
        </ExternalLink>
      </LinkListItem>
    )
  })

  return (
    <>
      <NavigationWrapper
        ref={navigationRef}
        $isNavigationVisible={isNavigationVisible}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!isNavigationVisible}
      >
        <SectionsWrapper>
          <CloseButtonWrapper>
            <IconButton
              icon="close"
              ariaLabel="Close navigation"
              onClick={toggleNavigation}
              size="LARGE"
            />
          </CloseButtonWrapper>
          <Section>
            <Header>GALLERIES</Header>
            <ul>{links}</ul>
          </Section>

          <Section>
            <Header>ABOUT</Header>
            <ul>{aboutLinks}</ul>
          </Section>

          <Section>
            <Header>MISC</Header>
            <ul>{miscLinks}</ul>
          </Section>
        </SectionsWrapper>
      </NavigationWrapper>
      <NavigationGutter
        $isNavigationVisible={isNavigationVisible}
        onClick={toggleNavigation}
      />
    </>
  )
}

const NavigationGutter = styled.nav<{ $isNavigationVisible: boolean }>`
  transition: opacity ${TRANSITION_SPEED}s, visibility ${TRANSITION_SPEED}s;
  opacity: ${props => (props.$isNavigationVisible ? 1 : 0)};
  visibility: ${props => (props.$isNavigationVisible ? 'visible' : 'hidden')};
  position: fixed;
  left: 0;
  top: 0;
  background-color: color-mix(in srgb, ${COLORS.FOREGROUND} 20%, transparent);
  width: 100vw;
  height: 100vh;
  z-index: 998;
`

const NavigationWrapper = styled.div<{ $isNavigationVisible: boolean }>`
  box-sizing: border-box;
  display: flex;
  position: fixed;
  z-index: 999;
  top: 0;
  overflow: scroll;
  background-color: ${COLORS.BACKGROUND};
  transition: right ${TRANSITION_SPEED}s, visibility ${TRANSITION_SPEED}s;
  visibility: ${({ $isNavigationVisible }) =>
    $isNavigationVisible ? 'visible' : 'hidden'};
  right: ${({ $isNavigationVisible }) =>
    $isNavigationVisible ? '0' : '-100vw'};

  /* box-shadow: -1px 0px 1.5px hsl(0deg 0% 72% / 0),
    -17.4px 0px 26.1px hsl(0deg 0% 72% / 0.53); */
`

const CloseButtonWrapper = styled.div`
  position: absolute;
  top: ${CONTENT_SPACING.XLARGE};
  right: ${CONTENT_SPACING.XLARGE};
`

const SectionsWrapper = styled.div`
  z-index: 999;
  padding: ${CONTENT_SPACING.XLARGE};
  height: 100vh;
  box-sizing: border-box;
  flex-direction: column;
  width: 300px;
  overflow: auto;
`

const Section = styled.section`
  margin-bottom: ${CONTENT_SPACING.XLARGE};
  :last-child {
    margin-top: 0;
  }
`

const LinkListItem = styled.li`
  padding: ${CONTENT_SPACING.SMALL} 0;

  position: relative;
  left: calc(-1 * (${CONTENT_SPACING.MEDIUM} + 5px));
`

const sharedStyles = css`
  border-left: 5px solid transparent;
  padding-left: ${CONTENT_SPACING.MEDIUM};
  font-weight: 300;
  text-decoration: none;
  font-size: ${FONT_SIZES.SMALL};
  color: ${COLORS.FOREGROUND};

  &:visited {
    color: ${COLORS.FOREGROUND};
  }

  @media (hover: hover) {
    &:hover {
      color: ${COLORS.PRIMARY};
      border-left-color: ${COLORS.PRIMARY};
    }
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.PRIMARY};
    outline-offset: 2px;
  }
`

const Header = styled.h2`
  font-weight: 700;
  font-size: ${FONT_SIZES.SMALL};
  margin-bottom: ${CONTENT_SPACING.SMALL};
`

const InternalLink = styled(Link)`
  ${sharedStyles}
`

const ExternalLink = styled.a`
  ${sharedStyles}
`

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

export default Navigation
