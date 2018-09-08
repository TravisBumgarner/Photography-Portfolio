import React, { Component } from 'react'

import { ContactWrapper, ContactFormWrapper } from './Contact.styles'

import { ContactForm } from 'Containers'

class Contact extends Component {
    render() {
        return (
            <ContactWrapper>
                <ContactFormWrapper>
                    <ContactForm />
                </ContactFormWrapper>
            </ContactWrapper>
        )
    }
}

export default Contact
