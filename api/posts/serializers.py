from .models import *
from rest_framework import serializers


class PostSerializer(serializers.ModelSerializer):

    class Meta:
        model = Post
        fields = (
            'id',
            'title',
            'summary',
            'date',
            'content'
        )
