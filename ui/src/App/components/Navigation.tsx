import React, { ReactElement, useMemo } from 'react'
import { Link, useMatch } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { Header } from 'sharedComponents'
import { FONT_FAMILY_HEADER, CONTENT_SPACING, TEXT_FONT_SIZES } from 'theme'
import { GalleryType } from 'types'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useCallback } from 'react'

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
    galleries: GalleryType[],
    toggleNavigation: () => void
}

const Navigation = ({ galleries, toggleNavigation }: Props) => {
    const projectLinks = useRef<ReactElement[]>([])
    const snapshotLinks = useRef<ReactElement[]>([])

    useMemo(() => {
        galleries.sort((a, b) => (a.title > b.title ? 1 : -1))
        galleries.map(({ title, content_type, slug }) => {
            const link = (
                <LinkListItem key={slug} onClick={toggleNavigation}>
                    <InternalLink to={`/portfolio/${content_type}/${slug}`}>{title}</InternalLink>
                </LinkListItem>
            )
            if (content_type.toLowerCase() === 'project') {
                projectLinks.current.push(link)
            } else if (content_type.toLowerCase() === 'snapshot') {
                snapshotLinks.current.push(link)
            }
        })
    }, [galleries])

    const socialSectionContent = [
        {
            title: 'LinkedIn',
            route: 'https://www.linkedin.com/in/travisbumgarner/',
        }
    ]

    const socialLinks = useMemo(() => socialSectionContent.map(m => {
        return (
            <LinkListItem key={m.title} onClick={toggleNavigation}>
                <ExternalLink target="_blank" href={m.route}>{m.title}</ExternalLink>
            </LinkListItem>
        )
    }), [socialSectionContent])

    return (
        <NavigationWrapper>
            <SubNavigationWrapper>
                <Header size="medium">Photo Essays</Header>
                <ul>{projectLinks.current}</ul>
            </SubNavigationWrapper>

            <SubNavigationWrapper>
                <Header size="medium">Snapshots</Header>
                <ul>
                    {snapshotLinks.current}
                </ul>
            </SubNavigationWrapper>

            <SubNavigationWrapper>
                <Header size="medium">Connect</Header>
                <ul>
                    <LinkListItem key="about" onClick={toggleNavigation}>
                        <InternalLink to="/about">About</InternalLink>
                    </LinkListItem>
                    {socialLinks}
                </ul>
            </SubNavigationWrapper>
        </NavigationWrapper>
    )
}

export default Navigation
