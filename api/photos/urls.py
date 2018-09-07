from django.conf.urls import url, include
from rest_framework import routers

from .viewsets import *

router = routers.DefaultRouter()

router.register(r'projects', ProjectViewSet)
router.register(r'photos', PhotoViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^get_random_photo$', GetRandomImage.as_view()),
]