from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet, GenericViewSet
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response

import random

from api_django.settings import BACKGROUND_IMAGE_WIDTH
from .serializers import *
from .models import *


class GetRandomImage(APIView):
    queryset = Photo.objects.filter(width__gte=BACKGROUND_IMAGE_WIDTH)
    serializer_class = PhotoSerializer

    def get(self, request, format=None):
        random_object = self.queryset.order_by('?')[0]
        serializer = PhotoSerializer(random_object, context={"request": request})
        return Response(serializer.data)


class ProjectViewSet(ReadOnlyModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    pagination_class = None


class PhotoViewSet(ReadOnlyModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    pagination_class = None

