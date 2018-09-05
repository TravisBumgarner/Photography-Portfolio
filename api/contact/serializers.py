from .models import *
from rest_framework import serializers


class ContactSerializer(serializers.ModelSerializer):

    class Meta:
        model = Contact
        fields = (
            'name',
            'email',
            'website',
            'message',
        )
