from .models import *
from rest_framework import serializers


class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = (
            'id',
            'title',
            'description',
            'start_date',
            'end_date'
        )


class PhotoSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)

    class Meta:
        model = Photo
        fields = (
            'id',
            'src',
            'file_name',
            'title',
            'project',
            'location',
            'date_taken',
            'year',
            'width',
            'height',
            'exif_data',
            'color_sample_1',
            'color_sample_2',
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
            'focal_length'
        )
