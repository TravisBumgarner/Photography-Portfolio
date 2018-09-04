import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Header } from '../../components'

import {
    NavigationWrapper,
    SubNavigationWrapper,
    SiteLink,
    LinkListItem
} from './Navigation.styles.js'

const mainSectionContent = [
    { title: 'About', route: '/about' },
    { title: 'Contact', route: '/contact' }
]

const generateLinks = content => {
    return content.map(item => {
        return (
            <LinkListItem>
                <SiteLink key={item.title} to={item.route}>
                    {item.title}
                </SiteLink>
            </LinkListItem>
        )
    })
}

class Navigation extends Component {
    render() {
        const { toggleNavigation, metadataProjects, metadataYears } = this.props

        const projectsSectionContent = metadataProjects.map(project => ({
            title: project,
            route: `/projects/${project}`
        }))
        const yearsSectionContent = metadataYears.map(year => ({
            title: year,
            route: `/singles/${year}`
        }))

        console.log(projectsSectionContent, yearsSectionContent)

        const mainLinks = generateLinks(mainSectionContent)
        const projectsLinks = generateLinks(projectsSectionContent)
        const yearsLinks = generateLinks(yearsSectionContent)

        return (
            <NavigationWrapper>
                <SubNavigationWrapper>
                    <Header size="large">Travis Bumgarner Photography</Header>
                </SubNavigationWrapper>

                <SubNavigationWrapper>
                    <Header size="medium">Main</Header>
                    <ul>
                        <li onClick={toggleNavigation}>Home</li>
                        {mainLinks}
                    </ul>
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
    toggleNavigation: PropTypes.func.isRequired,
    metadataProjects: PropTypes.array.isRequired,
    metadataYears: PropTypes.array.isRequired
}

export default Navigation
