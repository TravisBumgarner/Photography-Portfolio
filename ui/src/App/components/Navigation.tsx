import React, { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { CONTENT_SPACING, FONT_FAMILY_HEADER, TEXT_FONT_SIZES, HEADER_FONT_SIZES } from '../../theme'
import { context } from '../context'

interface Props {
  toggleNavigation: () => void
}

const Navigation = ({ toggleNavigation }: Props) => {
  const { state: { galleries } } = useContext(context)

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

  const aboutContent = [
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

  const miscContent = [
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

  const aboutLinks = aboutContent.map(m => {
    return (
      <LinkListItem key={m.title} onClick={toggleNavigation}>
        <ExternalLink target={m.external ? '_blank' : ''} href={m.route}>{m.title}</ExternalLink>
      </LinkListItem>
    )
  })

  const miscLinks = miscContent.map(m => {
    return (
      <LinkListItem key={m.title} onClick={toggleNavigation}>
        <ExternalLink target={m.external ? '_blank' : ''} href={m.route}>{m.title}</ExternalLink>
      </LinkListItem>
    )
  })

  return (
    <NavigationWrapper>
      <SubNavigationWrapper>
        <Header>GALLERIES</Header>
        <ul>{links}</ul>
      </SubNavigationWrapper>

      <SubNavigationWrapper>
        <Header>ABOUT</Header>
        <ul>
          {aboutLinks}
        </ul>
      </SubNavigationWrapper>

      <SubNavigationWrapper>
        <Header>MISC</Header>
        <ul>
          {miscLinks}
        </ul>
      </SubNavigationWrapper>
    </NavigationWrapper>
  )
}

const NavigationWrapper = styled.div`
    z-index: 999;
    padding: ${CONTENT_SPACING.l};
    border-left: 5px solid black;
    height: 100vh;
    box-sizing: border-box;
    flex-direction: column;
    width: 350px;
    background-color: rgba(255, 255, 255, 1);
    overflow: auto;
`

const SubNavigationWrapper = styled.div`
    margin: ${CONTENT_SPACING.m} 0;

    margin-bottom: 2rem;
    :last-child {
        margin-top: 0;
    }
`

const LinkListItem = styled.li`
  a { 
    font-weight: 300;
    font-size: 0.8rem;
  }
    /* padding-left: ${CONTENT_SPACING.s}; */
    /* border-left: 5px solid transparent;
    &:hover {
        border-left-color: rgb(74, 207, 160);
    } */
`

const sharedStyles = css`
    text-decoration: none;
    font-family: ${FONT_FAMILY_HEADER};
    font-size: ${TEXT_FONT_SIZES.m};
    color: black;
    width: 100%;
    display: inline-block;

    &:visited {
        color: black;
    }
`

const Header = styled.h3`
    font-weight: 700;
    font-family: ${FONT_FAMILY_HEADER};
    font-size: ${HEADER_FONT_SIZES.s};
    margin-bottom: ${CONTENT_SPACING.s};
    margin-top: ${CONTENT_SPACING.s};
`

const InternalLink = styled(Link)`
    ${sharedStyles}
`

const ExternalLink = styled.a`
    ${sharedStyles}
`

export default Navigation
