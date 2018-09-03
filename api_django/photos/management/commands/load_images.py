import os

from django.core.files import File
from django.core.management.base import BaseCommand
from photos.models import Project, Photo
from api_django.settings import MEDIA_ROOT

INPUT_ROOT = '/Users/travisbumgarner/Documents/programming/photo20/api_django/photos/test_images'

class Command(BaseCommand):
    def handle(self, *args, **options):
        for input_project_directory in os.listdir(INPUT_ROOT):
            for input_file_name in os.listdir(os.path.join(INPUT_ROOT, input_project_directory)):
                input_file_root, file_extension = input_file_name.split('.')
                # input_file_root is assumed to be of format year_location_sequence.jpg
                
                year, location, sequence = input_file_root.split('_')
                
                output_year_directory = os.path.join(MEDIA_ROOT, year)
                if not os.path.exists(output_year_directory):
                    os.mkdir(output_year_directory)

                output_location_sub_directory = os.path.join(MEDIA_ROOT, year, location)
                if not os.path.exists(output_location_sub_directory):
                    os.mkdir(output_location_sub_directory)

                input_file_data = open(os.path.join(INPUT_ROOT, input_project_directory, input_file_name), 'rb')
                output_file_name = os.path.join(output_location_sub_directory, '{}.{}'.format(sequence, file_extension))
                f = File(name= output_file_name, file=input_file_data)
                p = Photo(file_name=output_file_name, src=f)
                p.save()