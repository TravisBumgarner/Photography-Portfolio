import React, { Component } from 'react'

import { ContactWrapper } from './Contact.styles'

import { ContactForm } from 'Containers'
import { Input, Button } from 'Components'

class Contact extends Component {
    render() {
        return (
            <ContactWrapper>
                <ContactForm />
            </ContactWrapper>
        )
    }
}

export default Contact
