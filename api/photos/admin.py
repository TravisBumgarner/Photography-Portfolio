# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from .models import *


@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = (
        'title',
    )


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = (
        'file_name',
        'make',
        'model',
        'lens',
        'shooting_mode',
        'aperture',
        'shutter_speed',
        'iso',
        'focal_length',
        'date_taken'
    )
    search_fields = ('file_name',)
