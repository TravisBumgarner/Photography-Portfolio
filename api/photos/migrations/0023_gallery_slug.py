# Generated by Django 2.1.1 on 2018-10-14 15:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('photos', '0022_remove_photo_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='gallery',
            name='slug',
            field=models.CharField(max_length=200, null=True),
        ),
    ]