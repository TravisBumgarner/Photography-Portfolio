import React, { useCallback, useMemo, useState } from 'react'
import NavigationAnimation from 'src/sharedComponents/NavigationAnimation'
import PageHeader from 'src/sharedComponents/PageHeader'
import { CONTENT_SPACING } from 'src/theme'
import styled from 'styled-components'

const MESSAGE_LENGTH = 800

const Form = styled.form`
  max-width: 500px;
`

const Input = styled.input`
  margin-bottom: ${CONTENT_SPACING.LARGE};
  border: 0;
  width: 100%;
  background-color: transparent;
  display: block;
  padding-left: ${CONTENT_SPACING.LARGE};
  border-left: 5px solid var(--color-foreground);
  &:focus {
    border-left: 5px solid var(--color-primary);
  }
`

const TextArea = styled.textarea`
  margin-bottom: ${CONTENT_SPACING.LARGE};
  border: 0;
  min-height: 100px;
  width: 100%;
  background-color: transparent;
  display: block;
  padding-left: ${CONTENT_SPACING.LARGE};
  border-left: 5px solid var(--color-foreground);
  &:focus {
    border-left: 5px solid var(--color-primary);
  }
`

const ContentWrapper = styled.div`
  display: flex;
  margin: ${CONTENT_SPACING.LARGE} 0;
  flex-direction: column;
  padding-left: ${CONTENT_SPACING.LARGE};
`

const SubmitButton = styled.button<{ $disabled?: boolean }>`
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: none;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  font-weight: 700;
  font-size: 1rem;
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  border-left: 5px solid var(--color-foreground);
`

const Contact = () => {
  const [success, setSuccess] = useState(false)
  const [failure, setFailure] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: 'photography-portfolio-and-blog'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.name === 'message' && e.target.value.length > MESSAGE_LENGTH) {
      return
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      const response = await fetch('https://contact-form.nfshost.com/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setSuccess(true)
        setFormData(prev => ({
          ...prev,
          ...{
            name: '',
            email: '',
            message: ''
          }
        }))
      } else {
        setFailure(true)
      }
      setIsSubmitting(false)
    },
    [formData]
  )

  const resetButtonText = useCallback(() => {
    setTimeout(() => {
      setSuccess(false)
      setFailure(false)
    }, 3_000)
  }, [])

  const buttonText = useMemo(() => {
    if (isSubmitting) {
      return 'Sending...'
    }
    if (success) {
      resetButtonText()
      return 'Message sent!'
    }
    if (failure) {
      resetButtonText()
      return 'Failed to send message.'
    }
    return 'Send'
  }, [isSubmitting, success, failure, resetButtonText])

  return (
    <NavigationAnimation>
      <ContentWrapper>
        <PageHeader>Contact</PageHeader>
        <Form onSubmit={handleSubmit}>
          <Input placeholder="Name (Optional)" name="name" value={formData.name} onChange={handleChange} />
          <Input
            placeholder="Email (Optional)"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span>
              {formData.message.length}/{MESSAGE_LENGTH}
            </span>
          </div>
          <TextArea placeholder="Message" name="message" value={formData.message} onChange={handleChange} />
          <SubmitButton
            $disabled={isSubmitting || formData.message.length === 0}
            type="submit"
            disabled={isSubmitting || formData.message.length === 0}
          >
            {buttonText}
          </SubmitButton>
        </Form>
      </ContentWrapper>
    </NavigationAnimation>
  )
}

export default Contact
