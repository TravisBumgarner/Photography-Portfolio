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
    pass
