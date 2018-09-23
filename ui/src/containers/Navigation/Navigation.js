import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Header } from 'Components'

import {
    NavigationWrapper,
    SubNavigationWrapper,
    InternalLink,
    ExternalLink,
    LinkListItem
} from './Navigation.styles.js'

class Navigation extends Component {
    render() {
        const { metadata, theme, toggleNavigation } = this.props

        const projectsLinks = Object.entries(metadata.projects).map(([id, title]) => {
            return (
                <LinkListItem key={id} onClick={toggleNavigation}>
                    <InternalLink theme={theme} to={`/portfolio/project/${id}`}>
                        {title}
                    </InternalLink>
                </LinkListItem>
            )
        })

        const yearsLinks = metadata.years.map(year => {
            return (
                <LinkListItem key={year} onClick={toggleNavigation}>
                    <InternalLink theme={theme} to={`/portfolio/singles/${year}`}>
                        {year}
                    </InternalLink>
                </LinkListItem>
            )
        })

        const socialSectionContent = [
            { title: 'Instagram', route: 'https://www.instagram.com/esafoto/' },
            {
                title: 'Flickr',
                route: 'https://www.flickr.com/people/esa_foto/'
            },
            {
                title: 'National Geographic',
                route: 'https://yourshot.nationalgeographic.com/profile/778640/'
            }
        ]

        const socialLinks = socialSectionContent.map(m => {
            return (
                <LinkListItem key={m.title}>
                    <ExternalLink theme={theme} href={m.route} target="_blank">
                        {m.title}
                    </ExternalLink>
                </LinkListItem>
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
                    <InternalLink theme={theme} to={m.route}>
                        {m.title}
                    </InternalLink>
                </LinkListItem>
            )
        })

        return (
            <NavigationWrapper theme={theme}>
                <SubNavigationWrapper>
                    <InternalLink theme={theme} to={`/`}>
                        <Header size="large">
                            Travis
                            <br />
                            Bumgarner
                        </Header>
                        <ul>{miscLinks}</ul>
                    </InternalLink>
                </SubNavigationWrapper>

                <SubNavigationWrapper>
                    <Header size="medium">Projects</Header>
                    <ul>{projectsLinks}</ul>
                </SubNavigationWrapper>

                <SubNavigationWrapper>
                    <Header size="medium">Snapshots</Header>
                    <ul>
                        <LinkListItem key={'all'} onClick={toggleNavigation}>
                            <InternalLink theme={theme} to={`/portfolio/singles/all`}>
                                All
                            </InternalLink>
                        </LinkListItem>
                        {yearsLinks}
                    </ul>
                </SubNavigationWrapper>

                <SubNavigationWrapper>
                    <Header size="medium">Social</Header>
                    <ul>{socialLinks}</ul>
                </SubNavigationWrapper>
            </NavigationWrapper>
        )
    }
}

Navigation.propTypes = {
    metadata: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    toggleNavigation: PropTypes.func.isRequired
}

export default Navigation
