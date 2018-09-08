import os

from django.core.files import File
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.management.base import BaseCommand
import colorgram
import os
from io import StringIO, BytesIO
from PIL import Image, ImageDraw

from photos.models import Project, Photo
from api_django.settings import MEDIA_ROOT

INPUT_ROOT = '/Users/travisbumgarner/Documents/programming/photo20/api/photos/test_images'

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

def process_cannon(raw_exif_data):
    processed_exif_data = {}
    processed_exif_data['camera_type']      = "DSLR"
    processed_exif_data['make']             = str(raw_exif_data['Image Make'])
    processed_exif_data['model']            = str(raw_exif_data['Image Model'])
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
            print('{} has no make or model'.format(full_path))
            return None
            
        if raw_make in ['NIKON CORPORATION'] and raw_model in ['NIKON D5300', 'NIKON D3400']:
            processed_exif_data = process_nikon(raw_exif_data)
        
        elif raw_make in ['Canon'] and raw_model in ['Canon EOS DIGITAL REBEL XS']:
            processed_exif_data = process_cannon(raw_exif_data)
        
        elif raw_make in ['NORITSU KOKI'] and raw_model in ['QSS-32_33', 'EZ Controller']:
            processed_exif_data = process_noritsu_scanner(raw_exif_data)

        elif raw_make in ['SONY'] and raw_model in ['DSC-RX100']:
            processed_exif_data = process_sony_rx100(raw_exif_data)
        
        elif raw_make in ['LGE'] and raw_model in ['Nexus 5X']:
            processed_exif_data = process_nexus_5x(raw_exif_data)
        
        elif raw_make in ['motorola'] and raw_model in ['moto x4']:
            processed_exif_data = process_moto_x4(raw_exif_data)
        
        else:
            print('"{}"{}'.format(raw_make, raw_model))

        im = Image.open(full_path)
        processed_exif_data['width'], processed_exif_data['height'] = im.size

        return processed_exif_data


def get_two_vibrant_color_samples(full_path, generate_preview_image=False):
    basename = os.path.basename(full_path)
    dirname = os.path.dirname(full_path)

    samples = 6
    colors = colorgram.extract(full_path, samples)
    # Most vibrant colors exist
    #   Hue: any
    #   Saturation closest to 100
    #   Luminace: closest to 50
    sorted_colors = sorted(colors, key=lambda c: abs(100 - c.hsl.s) + abs(50 - c.hsl.l))

    if generate_preview_image:
        inputImage = Image.open(full_path)
        inputImageWidth, inputImageHeight = inputImage.size
        imageSideRatio = inputImageHeight / inputImageWidth

        width = 100
        height = 100
        totalOutputWidth = width * samples

        outputImageHeight = int(imageSideRatio * totalOutputWidth)
        resizedInputImage = inputImage.resize((totalOutputWidth, outputImageHeight), Image.ANTIALIAS)

        im = Image.new("RGB", (width * 6, height + outputImageHeight), "white")
        draw = ImageDraw.Draw(im)
        im.paste(resizedInputImage, (0, height))
        
        for index, color in enumerate(sorted_colors):
            print(index, color)
            draw.rectangle([index*100, 0, (index+1)*100, height], fill = color.rgb)

        samples_directory = os.path.join(dirname, 'samples')
        if not os.path.exists(samples_directory):
            os.mkdir(samples_directory)
        im.save(os.path.join(samples_directory, basename))

    rgb_most_vibrant = 'rgb({},{},{})'.format(colors[0].rgb.r, colors[0].rgb.g, colors[0].rgb.b)
    rgb_second_vibrant = 'rgb({},{},{})'.format(colors[1].rgb.r, colors[1].rgb.g, colors[1].rgb.b)
    return [rgb_most_vibrant, rgb_second_vibrant]


# def make_required_year_and_location_directories(year, location):
#     output_year_directory = os.path.join(MEDIA_ROOT, year)
#     if not os.path.exists(output_year_directory):
#         os.mkdir(output_year_directory)

#     output_location_sub_directory = os.path.join(MEDIA_ROOT, year, location)
#     if not os.path.exists(output_location_sub_directory):
#         os.mkdir(output_location_sub_directory)


class Command(BaseCommand):
    def handle(self, *args, **options):
        for input_project_directory in os.listdir(INPUT_ROOT):
            
            if not os.path.isdir(os.path.join(INPUT_ROOT, input_project_directory)):
                print('Skipping directory: {}'.format(input_project_directory))
                continue
            else:
                print('Processing directory: {}'.format(input_project_directory))

            for input_file_name in os.listdir(os.path.join(INPUT_ROOT, input_project_directory)):
                input_full_path = os.path.join(INPUT_ROOT, input_project_directory, input_file_name)
                input_file_root, file_extension = input_file_name.split('.')
                
                if file_extension not in ['jpg', 'jpeg']:
                    print('    Skipping file: {}'.format(input_file_name))
                    continue
                else: 
                    print('    Processing file: {}'.format(input_file_name))


                year, location, sequence = input_file_root.split('_')

                # make_required_year_and_location_directories(year, location)

                exif_data = process_exif_data(input_full_path)
                if not exif_data:
                    continue

                # color_sample_1, color_sample_2 = get_two_vibrant_color_samples(input_full_path)
                color_sample_1 = 'rgb(0,0,0)'
                color_sample_2 = 'rgb(0,0,0)'

    
                src = File(
                    name = os.path.join('full', year, location, '{}.{}'.format(sequence, file_extension)),
                    file = open(input_full_path, 'rb')
                )

                im_thumb_small = Image.open(input_full_path)
                im_thumb_small.thumbnail((200,200))
                thumb_io = BytesIO()
                im_thumb_small.save(thumb_io, format='JPEG')
                thumb_small_file = InMemoryUploadedFile(
                    thumb_io,
                    None,
                    '{}.{}'.format(sequence, file_extension),
                    'image/jpeg',
                    None,
                    None
                )

                src_thumbnail_small = File(
                    name = os.path.join('small', year, location, '{}.{}'.format(sequence, file_extension)),
                    file = thumb_small_file
                )


                project, _ = Project.objects.get_or_create(
                    title               = input_project_directory
                )

                photo = Photo(
                    file_name            = os.path.join('full', year, location, '{}.{}'.format(sequence, file_extension)),
                    src                  = src,
                    exif_data            = exif_data,
                    date_taken           = exif_data['date_taken'],
                    width                = exif_data['width'],
                    height               = exif_data['height'],
                    location             = location,
                    year                 = year,
                    project              = project,
                    color_sample_1       = color_sample_1,
                    color_sample_2       = color_sample_2,
                    src_thumbnail_small  = src_thumbnail_small,
                    # src_thumbnail_medium = thumbnail_medium
                    
                )
                photo.save()
