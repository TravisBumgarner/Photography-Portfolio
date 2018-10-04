from django.conf.urls import url, include
from rest_framework import routers

from .viewsets import *

router = routers.DefaultRouter()

router.register(r'galleries', GalleryViewSet, base_name='Galleries')
router.register(r'photos', PhotoViewSet, base_name='Photos')
router.register(r'locations', LocationViewSet, base_name='Locations')
router.register(r'categories', CategoryViewSet, base_name='Categories')

urlpatterns = [
    url(r'^', include(router.urls)),
]
