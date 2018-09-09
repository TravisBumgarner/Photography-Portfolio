from django.db import models


class Project(models.Model):
    title = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True)

    def __unicode__(self):
        return self.name


class Photo(models.Model):
    src = models.ImageField(blank=True, null=True)
    src_thumbnail_small = models.ImageField(blank=True, null=True)
    src_thumbnail_medium = models.ImageField(blank=True, null=True)
    file_name = models.CharField(max_length=200)
    title = models.CharField(max_length=200, null=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True)
    location = models.CharField(max_length=200)
    date_taken = models.DateField(null=True)
    year = models.IntegerField(null=True)
    width = models.IntegerField(null=True)
    height = models.IntegerField(null=True)
    exif_data = models.TextField(null=True)
    color_sample_1 = models.TextField(null=True)
    color_sample_2 = models.TextField(null=True)
    