import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { ContactWrapper } from './Contact.styles'

import { ContactForm } from 'Containers'
import { Header, Text } from 'Components'

class Contact extends Component {
    render() {
        const { theme } = this.props
        return (
            <ContactWrapper>
                <Header size="medium">Contact</Header>
                <Text>Let's grab a beer (or coffee), work, or volunteer together!</Text>
                <ContactForm theme={theme} />
            </ContactWrapper>
        )
    }
}

Contact.propTypes = {
    theme: PropTypes.object.isRequired
}

export default Contact
