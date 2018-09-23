import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { ContactWrapper, ContentWrapper } from './Contact.styles'

import { ContactForm } from 'Containers'
import { Header, Text } from 'Components'

class Contact extends Component {
    render() {
        const { theme } = this.props
        return (
            <ContactWrapper>
                <ContentWrapper>
                    <Header size="large">Contact</Header>
                    <Text>Let's grab a beer (or coffee), work, or volunteer together!</Text>
                    <ContactForm theme={theme} />
                </ContentWrapper>
            </ContactWrapper>
        )
    }
}

Contact.propTypes = {
    theme: PropTypes.object.isRequired
}

export default Contact
