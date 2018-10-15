import React, { Component, Fragment } from 'react'
import { FaInstagram, FaFlickr } from 'react-icons/fa'

import { NatGeoIcon } from 'Resources'
import { Header } from 'Components'
import { SNAPSHOT, PROJECT } from 'Constants'

import {
    NavigationWrapper,
    SubNavigationWrapper,
    InternalLink,
    ExternalLink,
    LinkListItem,
    IconWrapper
} from './Navigation.styles.js'

class Navigation extends Component {
    render() {
        const { galleries, toggleNavigation, isHomepage } = this.props

        const projectLinks = []
        const snapshotLinks = []

        galleries.sort((a, b) => (a.title > b.title ? 1 : -1)) // Sort galleries alphabetically
        galleries.map(({ id, title, content_type, slug }) => {
            const link = (
                <LinkListItem key={id} onClick={toggleNavigation}>
                    <InternalLink to={`/portfolio/${content_type}/${slug}`}>{title}</InternalLink>
                </LinkListItem>
            )
            if (content_type === PROJECT) {
                projectLinks.push(link)
            } else if (content_type === SNAPSHOT) {
                snapshotLinks.push(link)
            }
        })

        // const locationLinks = []
        // locations.map(({ id, title }) => {
        //     const link = (
        //         <LinkListItem key={id} onClick={toggleNavigation}>
        //             <InternalLink to={`/portfolio/locations/${title}`}>{title}</InternalLink>
        //         </LinkListItem>
        //     )
        //     locationLinks.push(link)
        // })

        // const categoriesLinks = []
        // categories.map(({ id, title }) => {
        //     const link = (
        //         <LinkListItem key={id} onClick={toggleNavigation}>
        //             <InternalLink to={`/portfolio/categories/${title}`}>{title}</InternalLink>
        //         </LinkListItem>
        //     )
        //     categoriesLinks.push(link)
        // })

        const socialSectionContent = [
            {
                title: 'Instagram',
                route: 'https://www.instagram.com/esafoto/',
                icon: <FaInstagram size="2em" />
            },
            {
                title: 'Your Shot National Geographic',
                route: 'https://yourshot.nationalgeographic.com/profile/778640/',
                icon: <NatGeoIcon size="2em" />
            },
            {
                title: 'Flickr',
                route: 'https://www.flickr.com/people/esa_foto/',
                icon: <FaFlickr size="2em" />
            }
        ]

        const socialLinks = socialSectionContent.map(m => {
            return (
                <IconWrapper key={m.title} title={m.title}>
                    <ExternalLink href={m.route} target="_blank">
                        {m.icon}
                    </ExternalLink>
                </IconWrapper>
            )
        })

        const miscSectionContent = [
            { title: 'Blog', route: '/blog' },
            { title: 'About', route: '/about' },
            { title: 'Contact', route: '/contact' }
        ]

        const miscLinks = miscSectionContent.map(m => {
            return (
                <LinkListItem key={m.title} onClick={toggleNavigation}>
                    <InternalLink to={m.route}>{m.title}</InternalLink>
                </LinkListItem>
            )
        })

        return (
            <Fragment>
                <NavigationWrapper isHomepage={isHomepage}>
                    <SubNavigationWrapper>
                        <Header size="medium">Main</Header>
                        <ul>{miscLinks}</ul>
                    </SubNavigationWrapper>

                    <SubNavigationWrapper>
                        <Header size="medium">Photo Essays</Header>
                        <ul>{projectLinks}</ul>
                    </SubNavigationWrapper>

                    <SubNavigationWrapper>
                        <Header size="medium">Snapshots</Header>
                        {/* <Header size="small">By Year</Header> */}
                        <ul>
                            <LinkListItem key={'all'} onClick={toggleNavigation}>
                                <InternalLink to={`/portfolio/${SNAPSHOT}/all`}>All</InternalLink>
                            </LinkListItem>
                            {snapshotLinks}
                        </ul>
                        {/* <Header size="small">By Category</Header>
                        <ul>{categoriesLinks}</ul>
                        <Header size="small">By Location</Header>
                        <ul>{locationLinks}</ul> */}
                    </SubNavigationWrapper>

                    <SubNavigationWrapper>{socialLinks}</SubNavigationWrapper>
                </NavigationWrapper>
            </Fragment>
        )
    }
}

export default Navigation
