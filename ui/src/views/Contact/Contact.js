import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { ContactWrapper, ContactFormWrapper } from './Contact.styles'

import { ContactForm } from 'Containers'

class Contact extends Component {
    render() {
        const { theme } = this.props
        return (
            <ContactWrapper>
                <ContactFormWrapper>
                    <ContactForm theme={theme} />
                </ContactFormWrapper>
            </ContactWrapper>
        )
    }
}

Contact.propTypes = {
    theme: PropTypes.object.isRequired
}

export default Contact
