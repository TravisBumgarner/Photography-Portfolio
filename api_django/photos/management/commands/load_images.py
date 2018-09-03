import os

from django.core.files import File
from django.core.management.base import BaseCommand
from photos.models import Project, Photo
from api_django.settings import MEDIA_ROOT

INPUT_ROOT = '/Users/travisbumgarner/Documents/programming/photo20/api_django/photos/test_images'

import os
import shutil
from datetime import datetime

from PIL import Image
import exifread

def compute_date(raw_str):
    date, _ = raw_str.split(' ')
    year, month, day = date.split(':')
    return datetime(int(year), int(month), int(day))

    dt = datetime.strftime


def print_raw_keys_and_data(raw_exif_data):
    for k in raw_exif_data.keys():
        if k == 'JPEGThumbnail':
            continue
        print(k, raw_exif_data[k])

def compute_fractional_string(raw_str):
    if '/' not in raw_str:
        return raw_str
    
    numerator, denominatior = raw_str.split('/')
    return str(float(numerator) / float(denominatior))

def process_nikon(raw_exif_data):
    processed_exif_data = {}
    
    _, model = str(raw_exif_data['Image Model']).split(' ')

    processed_exif_data['camera_type']      = "DSLR"
    processed_exif_data['make']             = 'Nikon'
    processed_exif_data['model']            = str(model)
    processed_exif_data['lens']             = str(raw_exif_data['EXIF LensModel'])
    processed_exif_data['date_taken']       = compute_date(str(raw_exif_data['EXIF DateTimeOriginal']))
    processed_exif_data['shooting_mode']    = str(raw_exif_data['EXIF ExposureProgram'])
    processed_exif_data['aperature']        = compute_fractional_string(str(raw_exif_data['EXIF FNumber']))
    processed_exif_data['shutter_speed']    = str(raw_exif_data['EXIF ExposureTime'])
    processed_exif_data['iso']              = str(raw_exif_data['EXIF ISOSpeedRatings'])
    
    return processed_exif_data

def process_noritsu_scanner(raw_exif_data):
    processed_exif_data = {}

    processed_exif_data['camera_type']      = "Film"
    processed_exif_data['make']             = "Film"
    processed_exif_data['model']            = None
    processed_exif_data['lens']             = None
    processed_exif_data['date_taken']       = None
    processed_exif_data['shooting_mode']    = None
    processed_exif_data['aperature']        = None
    processed_exif_data['shutter_speed']    = None
    processed_exif_data['iso']              = None
    
    return processed_exif_data

def process_sony_rx100(raw_exif_data):
    processed_exif_data = {}

    processed_exif_data['camera_type']      = "P&S"
    processed_exif_data['make']             = "Sony"
    processed_exif_data['model']            = "RX100 MKI"
    processed_exif_data['lens']             = str(raw_exif_data['EXIF LensModel'])
    processed_exif_data['date_taken']       = compute_date(str(raw_exif_data['EXIF DateTimeOriginal']))
    processed_exif_data['shooting_mode']    = str(raw_exif_data['EXIF ExposureProgram'])
    processed_exif_data['aperature']        = str(raw_exif_data['EXIF FNumber'])
    processed_exif_data['shutter_speed']    = str(raw_exif_data['EXIF ExposureTime'])
    processed_exif_data['iso']              = str(raw_exif_data['EXIF ISOSpeedRatings'])
    
    return processed_exif_data

def process_nexus_5x(raw_exif_data):
    processed_exif_data = {}

    processed_exif_data['camera_type']      = "Phone"
    processed_exif_data['make']             = "LG"
    processed_exif_data['model']            = "Nexus"
    processed_exif_data['lens']             = None
    processed_exif_data['date_taken']       = compute_date(str(raw_exif_data['EXIF DateTimeOriginal']))
    processed_exif_data['shooting_mode']    = str(raw_exif_data['EXIF ExposureMode'])
    processed_exif_data['aperature']        = str(raw_exif_data['EXIF FNumber'])
    processed_exif_data['shutter_speed']    = str(raw_exif_data['EXIF ExposureTime'])
    processed_exif_data['iso']              = str(raw_exif_data['EXIF ISOSpeedRatings'])
    
    return processed_exif_data

def process_moto_x4(raw_exif_data):
    processed_exif_data = {}

    processed_exif_data['camera_type']      = "Phone"
    processed_exif_data['make']             = "Motorola"
    processed_exif_data['model']            = "moto x4"
    processed_exif_data['lens']             = None
    processed_exif_data['date_taken']       = compute_date(str(raw_exif_data['EXIF DateTimeOriginal']))
    processed_exif_data['shooting_mode']    = str(raw_exif_data['EXIF ExposureMode'])
    processed_exif_data['aperature']        = str(raw_exif_data['EXIF FNumber'])
    processed_exif_data['shutter_speed']    = str(raw_exif_data['EXIF ExposureTime'])
    processed_exif_data['iso']              = str(raw_exif_data['EXIF ISOSpeedRatings'])
    
    return processed_exif_data

def process_exif_data(full_path):
        file_contents = open(full_path,'rb')

        processed_exif_data = {}
        raw_exif_data = exifread.process_file(file_contents)
        
        try:
            raw_make = str(raw_exif_data['Image Make'])
            raw_model = str(raw_exif_data['Image Model'])
        
        except KeyError:
            print('{} has no make or model'.format(f.name))
            return None
            
        if raw_make in ['NIKON CORPORATION'] and raw_model in ['NIKON D5300', 'NIKON D3400']:
            processed_exif_data = process_nikon(raw_exif_data)
        
        elif raw_make in ['NORITSU KOKI'] and raw_model in ['QSS-32_33', 'EZ Controller']:
            processed_exif_data = process_noritsu_scanner(raw_exif_data)

        elif raw_make in ['SONY'] and raw_model in ['DSC-RX100']:
            processed_exif_data = process_sony_rx100(raw_exif_data)
        
        elif raw_make in ['LGE'] and raw_model in ['Nexus 5X']:
            processed_exif_data = process_nexus_5x(raw_exif_data)
        
        elif raw_make in ['motorola'] and raw_model in ['moto x4']:
            processed_exif_data = process_moto_x4(raw_exif_data)
        
        im = Image.open(full_path)
        processed_exif_data['width'], processed_exif_data['height'] = im.size

        return processed_exif_data


def make_required_year_and_location_directories(year, location):
    output_year_directory = os.path.join(MEDIA_ROOT, year)
    if not os.path.exists(output_year_directory):
        os.mkdir(output_year_directory)

    output_location_sub_directory = os.path.join(MEDIA_ROOT, year, location)
    if not os.path.exists(output_location_sub_directory):
        os.mkdir(output_location_sub_directory)

class Command(BaseCommand):
    def handle(self, *args, **options):
        for input_project_directory in os.listdir(INPUT_ROOT):
            if input_project_directory == '.DS_Store':
                continue
                
            for input_file_name in os.listdir(os.path.join(INPUT_ROOT, input_project_directory)):
                input_full_path = os.path.join(INPUT_ROOT, input_project_directory, input_file_name)
                input_file_root, file_extension = input_file_name.split('.')
                
                if file_extension not in ['jpg', 'jpeg']:
                    pass

                year, location, sequence = input_file_root.split('_')

                make_required_year_and_location_directories(year, location)

                exif_data = process_exif_data(input_full_path)

                input_file_data = open(os.path.join(INPUT_ROOT, input_project_directory, input_file_name), 'rb')
                output_file_name = os.path.join(year, location, '{}.{}'.format(sequence, file_extension))
                f = File(
                    name = output_file_name,
                    file = input_file_data
                )
                p = Photo(
                    file_name           = output_file_name, 
                    src                 = f,
                    exif_data           = exif_data,
                    date_taken          = exif_data['date_taken'],
                    width               = exif_data['width'],
                    height              = exif_data['height'],
                    location            = location,
                    year                = year,
                )
                p.save()
