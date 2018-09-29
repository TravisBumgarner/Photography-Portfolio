from django.contrib import admin
from django.conf.urls import url, include, static
from django.urls import path

from api_django import settings


urlpatterns = [
    url(r'^api-auth/', include('rest_framework.urls')),
    path('admin/', admin.site.urls),
    url(r'^', include('posts.urls')),
    url(r'^', include('photos.urls')),
    url(r'^', include('contact.urls')),
]

from django.conf import settings
from django.conf.urls.static import static


if settings.DEBUG is True:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
