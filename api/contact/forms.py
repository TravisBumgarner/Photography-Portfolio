from django import forms


class ContactForm(forms.Form):
    name = forms.TextInput()
    subject = forms.TextInput()
    email = forms.EmailField()
    message = forms.Textarea()
