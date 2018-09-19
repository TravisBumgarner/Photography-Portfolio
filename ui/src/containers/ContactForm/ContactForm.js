import React, { Component } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'

import { ContactFormWrapper } from './ContactForm.styles'

import { Input, Button } from 'Components'

class ContactForm extends Component {
    constructor(props) {
        super(props)

        this.state = {
            name: '',
            website: '',
            message: '',
            email: '',
            isNotification: false,
            notificationMessage: ''
        }
    }

    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleSubmit = () => {
        const { name, website, message, email } = this.state

        const errors = []
        !name.length && errors.push('name')
        !message.length && errors.push('message')
        !email.length && errors.push('email')

        errors.length
            ? alert(
                  `Please fill in these required fields ${errors.join(', ')}.`
              )
            : axios.post('http://localhost:8000/contact/', {
                  name,
                  website,
                  message,
                  email
              })
    }

    render() {
        const { theme } = this.props
        return (
            <ContactFormWrapper>
                <Input
                    theme={theme}
                    value={this.state.name}
                    onChange={this.handleChange}
                    hintText="Full Name"
                    name="name"
                />
                <Input
                    theme={theme}
                    value={this.state.email}
                    onChange={this.handleChange}
                    hintText="Email Address"
                    name="email"
                />
                <Input
                    theme={theme}
                    value={this.state.website}
                    onChange={this.handleChange}
                    hintText="Website (Optional)"
                    name="website"
                />
                <Input
                    theme={theme}
                    value={this.state.message}
                    onChange={this.handleChange}
                    hintText="Message"
                    name="message"
                    multiLine
                    rows={5}
                    textarea
                />
                <Button
                    theme={theme}
                    label="Submit"
                    onClick={this.handleSubmit}
                />
            </ContactFormWrapper>
        )
    }
}

ContactForm.propTypes = {
    theme: PropTypes.object.isRequired
}

export default ContactForm
