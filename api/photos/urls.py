from django.conf.urls import url, include
from rest_framework import routers

from .viewsets import *

router = routers.DefaultRouter()

router.register(r'projects', ProjectViewSet)
router.register(r'random_photo', RandomImageViewSet)
router.register(r'photos', PhotoViewSet)
