from .models import *
from rest_framework import serializers


class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = (
            'id',
            'title',
        )


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = (
            'id',
            'title',
        )


class GallerySerializer(serializers.ModelSerializer):

    class Meta:
        model = Gallery
        fields = (
            'id',
            'title',
            'content_type',
            'description',
            'start_date',
            'end_date',
            'slug',
        )


class PhotoSerializer(serializers.ModelSerializer):
    gallery = GallerySerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    category = CategorySerializer(read_only=True, many=True)

    class Meta:
        model = Photo
        fields = (
            'id',
            'src',
            'file_name',
            'gallery',
            'location',
            'date_taken',
            'category',
            'width',
            'height',
            'src_thumbnail_medium',
            'src_thumbnail_small',
            'camera_type',
            'make',
            'model',
            'lens',
            'shooting_mode',
            'aperture',
            'shutter_speed',
            'iso',
            'focal_length',
            'is_home_background',
        )
