from django.conf.urls import url, include
from rest_framework import routers

from .viewsets import *

router = routers.DefaultRouter()

router.register(r'categories', CategoryViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'photos', PhotoViewSet)
router.register(r'contact', ContactViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^get_random_image$', GetRandomImage.as_view()),
]