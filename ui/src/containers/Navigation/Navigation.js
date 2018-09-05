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

class Navigation extends Component {
    render() {
        const {
            toggleNavigation,
            metadataProjects,
            metadataYears,
            filterPhotosByYear,
            filterPhotosByProject
        } = this.props

        const projectsLinks = metadataProjects.map(project => {
            return (
                <LinkListItem onClick={() => filterPhotosByProject(project)}>
                    {project}
                </LinkListItem>
            )
        })

        const yearsLinks = metadataYears.map(year => {
            return (
                <LinkListItem onClick={() => filterPhotosByYear(year)}>
                    {year}
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
                    <ul>
                        <LinkListItem>
                            <SiteLink to="/contact">Contact</SiteLink>
                        </LinkListItem>

                        <LinkListItem>
                            <SiteLink to="/about">About</SiteLink>
                        </LinkListItem>
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
    metadataYears: PropTypes.array.isRequired,
    filterPhotosByYear: PropTypes.func.isRequired,
    filterPhotosByProject: PropTypes.func.isRequired
}

export default Navigation
