from django.contrib import admin
from django.conf.urls import url, include, static
from django.urls import path
from django.conf.urls.static import static
from rest_framework import routers

from api_django import settings

from contact.urls import router as contact_router
from photos.urls import router as photos_router

class CombinedDefaultRouters(routers.DefaultRouter):
    """
    Extends `DefaultRouter` class to add a method for extending url routes from another router.
    """
    def extend(self, router):
        self.registry.extend(router.registry)


router = CombinedDefaultRouters()
router.extend(contact_router)
router.extend(photos_router)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls')),
    path('admin/', admin.site.urls),
    # url(r'^photos', include('photos.urls')),
    # url(r'^contact', include('contact.urls')),
]


if settings.DEBUG is True:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)