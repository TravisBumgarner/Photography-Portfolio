# Generated by Django 2.1.1 on 2018-10-18 18:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0002_post_src'),
    ]

    operations = [
        migrations.RenameField(
            model_name='post',
            old_name='src',
            new_name='photo_src',
        ),
    ]
