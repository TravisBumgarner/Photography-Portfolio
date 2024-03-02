import React, { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { Header } from 'sharedComponents'
import { FONT_FAMILY_HEADER, CONTENT_SPACING, TEXT_FONT_SIZES } from 'theme'
import { GalleryType } from 'types'

const NavigationWrapper = styled.div`
    text-align: right;
    z-index: 999;
    padding: ${CONTENT_SPACING.l};
    border-left: 5px solid black;
    height: 100vh;
    box-sizing: border-box;
    flex-direction: column;
    width: 350px;
    background-color: rgba(255, 255, 255, 1);
    overflow: scroll;
`

const SubNavigationWrapper = styled.div`
    margin: ${CONTENT_SPACING.m} 0;

    :last-child {
        margin-top: 2rem;
    }
`

const LinkListItem = styled.li`
    margin: ${CONTENT_SPACING.s} 0;

    &:hover {
        border-left: 5px solid rgb(74, 207, 160);
    }
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

const InternalLink = styled(Link)`
    ${sharedStyles}
`

const ExternalLink = styled.a`
    ${sharedStyles}
`

type Props = {
    galleries: Record<string, GalleryType>,
    toggleNavigation: () => void
}

const Navigation = ({ galleries, toggleNavigation }: Props) => {
    const links: ReactElement[] = []

    Object
        .values(galleries)
        .sort((a, b) => (a.title > b.title ? 1 : -1))
        .map(({ title, slug }) => {
            const link = (
                <LinkListItem key={slug} onClick={toggleNavigation}>
                    <InternalLink to={`/${slug}`}>{title}</InternalLink>
                </LinkListItem>
            )
            links.push(link)
        })

    const socialSectionContent = [
        {
            title: 'Connect',
            route: 'https://www.linkedin.com/in/travisbumgarner/',
            external: true,
          },
          {
            title: 'Engineering & Blog',
            route: 'https://travisbumgarner.com/',
            external: true,
          },
          {
            title: 'Awards & Recognition',
            route: '/about',
            external: false
        }
    ]

    const socialLinks = socialSectionContent.map(m => {
        return (
            <LinkListItem key={m.title} onClick={toggleNavigation}>
                <ExternalLink target={m.external ? "_blank" : ''} href={m.route}>{m.title}</ExternalLink>
            </LinkListItem>
        )
    })

    return (
        <NavigationWrapper>
            <SubNavigationWrapper>
                <Header size="medium">Galleries</Header>
                <ul>{links}</ul>
            </SubNavigationWrapper>

            <SubNavigationWrapper>
                <Header size="medium">Misc</Header>
                <ul>
                    {socialLinks}
                </ul>
            </SubNavigationWrapper>
        </NavigationWrapper>
    )
}

export default Navigation
