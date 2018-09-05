from django import forms


class ContactForm(forms.Form):
    name = forms.TextInput()
    website = forms.URLField()
    email = forms.EmailField()
    message = forms.Textarea()