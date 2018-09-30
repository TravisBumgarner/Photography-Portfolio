from django.db import models


class Gallery(models.Model):
    title = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True)
    content_type = models.CharField(max_length=20)

    def __unicode__(self):
        return self.title


class Category(models.Model):
    title = models.CharField(max_length=200, unique=True)

    def __unicode__(self):
        return self.title


class Location(models.Model):
    title = models.CharField(max_length=200, unique=True)

    def __unicode__(self):
        return self.title


class Photo(models.Model):
    # src
    src = models.ImageField(blank=True, null=True)
    src_thumbnail_small = models.ImageField(blank=True, null=True)
    src_thumbnail_medium = models.ImageField(blank=True, null=True)

    # File Details
    file_name = models.CharField(max_length=200)
    title = models.CharField(max_length=200, null=True)
    width = models.IntegerField(null=True)
    height = models.IntegerField(null=True)
    gallery = models.ForeignKey(Gallery, on_delete=models.CASCADE, null=True)

    # Hardware Details
    make = models.CharField(max_length=200, null=True)
    model = models.CharField(max_length=200, null=True)
    lens = models.CharField(max_length=200, null=True)

    # Photo Details
    date_taken = models.DateField(null=True)
    shooting_mode = models.CharField(max_length=200, null=True)
    aperture = models.CharField(max_length=200, null=True)
    shutter_speed = models.CharField(max_length=200, null=True)
    iso = models.CharField(max_length=200, null=True)
    focal_length = models.CharField(max_length=200, null=True)

    # Lightroom Metadata
    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=True)
    camera_type = models.CharField(max_length=200, null=True)
    category = models.ManyToManyField(Category)
