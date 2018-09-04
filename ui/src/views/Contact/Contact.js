import React, { Component } from 'react'

import { ContactWrapper } from './Contact.styles'

import { ContactForm } from '../../containers'
import { Input, Button } from '../../components'

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
