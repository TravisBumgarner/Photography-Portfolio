import React, { Component, Fragment } from 'react'
import axios from 'axios'

import { ContactFormWrapper, AlertWrapper } from './ContactForm.styles'

import { Input, Button, Text } from 'Components'

const DEFAULT_FORM_INPUTS = {
    name: '',
    subject: '',
    message: '',
    email: ''
}

const DEFAULT_ALERT = {
    isNotification: false,
    notificationMessage: ''
}

class ContactForm extends Component {
    constructor(props) {
        super(props)

        this.state = {
            ...DEFAULT_FORM_INPUTS,
            ...DEFAULT_ALERT
        }
    }

    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    createAlert = message => {
        this.setState({
            isNotification: true,
            notificationMessage: message
        })
        setTimeout(this.clearNotification, 10000)
    }

    handleSubmit = () => {
        const { name, subject, message, email } = this.state

        const errors = []
        !name.length && errors.push('name')
        !subject.length && errors.push('subject')
        !message.length && errors.push('message')
        !email.length && errors.push('email')

        errors.length
            ? this.createAlert(`Please fill in these required fields: ${errors.join(', ')}.`)
            : axios
                  .post(__API__ + 'contact/', {
                      name,
                      subject,
                      message,
                      email
                  })
                  .then(({ data }) => {
                      this.createAlert(data.detail)
                      this.clearForm()
                  })
                  .catch(error => {
                      this.createAlert('Sorry, something went wrong, please try again later!')
                  })
    }

    clearForm = () => {
        this.setState({ ...DEFAULT_FORM_INPUTS })
    }

    clearNotification = () => {
        this.setState({
            ...DEFAULT_ALERT
        })
    }

    render() {
        const { theme } = this.props
        const { notificationMessage, isNotification } = this.state
        return (
            <Fragment>
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
                <AlertWrapper isNotification={isNotification}>
                    <Text inverted>{notificationMessage}</Text>
                </AlertWrapper>
            </Fragment>
        )
    }
}

export default ContactForm
