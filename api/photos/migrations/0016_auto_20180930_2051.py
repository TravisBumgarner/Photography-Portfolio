# Generated by Django 2.1.1 on 2018-09-30 20:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('photos', '0015_auto_20180923_1624'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='photo',
            name='exif_data',
        ),
        migrations.AddField(
            model_name='photo',
            name='categories',
            field=models.CharField(max_length=500, null=True),
        ),
        migrations.AlterField(
            model_name='photo',
            name='location',
            field=models.CharField(max_length=200, null=True),
        ),
    ]
