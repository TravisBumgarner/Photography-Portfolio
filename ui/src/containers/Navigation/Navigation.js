import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Header } from 'Components'

import { Theme } from '../../views/App/App'

import {
    NavigationWrapper,
    SubNavigationWrapper,
    SiteLink,
    LinkListItem
} from './Navigation.styles.js'

const mainSectionContent = [
    { title: 'Home', route: '/' },
    { title: 'About', route: '/about' },
    { title: 'Contact', route: '/contact' }
]

class Navigation extends Component {
    render() {
        const { metadataProjects, metadataYears } = this.props

        const projectsLinks = metadataProjects.map(project => {
            return (
                <LinkListItem>
                    <SiteLink to={`/portfolio/project/${project}`}>
                        {project}
                    </SiteLink>
                </LinkListItem>
            )
        })

        const yearsLinks = metadataYears.map(year => {
            return (
                <LinkListItem>
                    <SiteLink to={`/portfolio/singles/${year}`}>
                        {year}
                    </SiteLink>
                </LinkListItem>
            )
        })

        const mainLinks = mainSectionContent.map(m => {
            return (
                <LinkListItem>
                    <SiteLink key={m.title} to={m.route}>
                        {m.title}
                    </SiteLink>
                </LinkListItem>
            )
        })

        return (
            <NavigationWrapper>
                <SubNavigationWrapper>
                    <Header size="large">Travis Bumgarner Photography</Header>
                </SubNavigationWrapper>

                <SubNavigationWrapper>
                    <Header size="medium">Main</Header>
                    <ul>{mainLinks}</ul>
                </SubNavigationWrapper>

                <SubNavigationWrapper>
                    <Header size="medium">Projects</Header>
                    <ul>{projectsLinks}</ul>
                </SubNavigationWrapper>

                <SubNavigationWrapper>
                    <Header size="medium">Singles</Header>
                    <ul>{yearsLinks}</ul>
                </SubNavigationWrapper>
            </NavigationWrapper>
        )
    }
}

Navigation.propTypes = {
    metadataProjects: PropTypes.array.isRequired,
    metadataYears: PropTypes.array.isRequired
}

export default Navigation
