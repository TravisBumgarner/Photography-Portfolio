from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet, GenericViewSet
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response

import random

from .serializers import *
from .models import *


class GalleryViewSet(ReadOnlyModelViewSet):
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer
    pagination_class = None


class LocationViewSet(ReadOnlyModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    pagination_class = None


class CategoryViewSet(ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None


class PhotoViewSet(ReadOnlyModelViewSet):
    queryset = Photo.objects.all().order_by('-date_taken')
    serializer_class = PhotoSerializer
    pagination_class = None
