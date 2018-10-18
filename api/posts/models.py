from django.db import models


class Post(models.Model):
    title = models.CharField(max_length=200, unique=True)
    summary = models.CharField(max_length=500, unique=True)
    content = models.TextField(blank=True, null=True)
    date = models.DateField(null=True)
    photo_src = models.ImageField(blank=True, null=True)

    def __unicode__(self):
        return self.title
