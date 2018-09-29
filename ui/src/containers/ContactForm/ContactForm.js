import React, { Component } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'

import { ContactFormWrapper } from './ContactForm.styles'

import { Input, Button } from 'Components'

const DEFAULT_FORM_INPUTS = {
    name: '',
    subject: '',
    message: '',
    email: ''
}

class ContactForm extends Component {
    constructor(props) {
        super(props)

        this.state = {
            ...DEFAULT_FORM_INPUTS,
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
        const { name, subject, message, email } = this.state

        const errors = []
        !name.length && errors.push('name')
        !subject.length && errors.push('subject')
        !message.length && errors.push('message')
        !email.length && errors.push('email')

        errors.length
            ? alert(`Please fill in these required fields ${errors.join(', ')}.`)
            : axios
                  .post(__API__ + 'contact/', {
                      name,
                      subject,
                      message,
                      email
                  })
                  .then(({ data }) => {
                      alert(data.detail)
                      this.clearForm()
                  })
                  .catch(error => {
                      alert('Sorry, something went wrong, please try again later!')
                  })
    }

    clearForm = () => {
        this.setState({ ...DEFAULT_FORM_INPUTS })
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
                    value={this.state.subject}
                    onChange={this.handleChange}
                    hintText="Subject"
                    name="subject"
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
                    value={this.state.message}
                    onChange={this.handleChange}
                    hintText="Message"
                    name="message"
                    multiLine
                    rows={5}
                    textarea
                />
                <Button theme={theme} label="Submit" onClick={this.handleSubmit} />
            </ContactFormWrapper>
        )
    }
}

ContactForm.propTypes = {
    theme: PropTypes.object.isRequired
}

export default ContactForm
