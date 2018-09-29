from django.db import models


class Contact(models.Model):
    name = models.CharField(max_length=200)
    subject = models.CharField(max_length=200)
    email = models.EmailField()
    message = models.TextField(max_length=2500)