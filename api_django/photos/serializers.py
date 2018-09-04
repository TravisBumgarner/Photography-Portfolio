from .models import *
from rest_framework import serializers


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = (
            'id',
            'name'
            )


class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = (
            'id',
            'title',
            'category',
            'description',
            'start_date',
            'end_date'
        )


class PhotoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Photo
        fields = (
            'src',
            'file_name',
            'title',
            'project',
            'location',
            'date_taken',
            'year',
            'width',
            'height',
            'exif_data'
        )


class ContactSerializer(serializers.ModelSerializer):

    class Meta:
        model = Contact
        fields = (
            'name',
            'email',
            'website',
            'message',
        )
