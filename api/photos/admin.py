# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from photos.models import *


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    pass


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    pass