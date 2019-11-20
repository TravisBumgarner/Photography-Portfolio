import os
import sys
from datetime import datetime
import shutil
from io import StringIO, BytesIO

from libxmp.utils import file_to_dict
import exifread

from django.core.files import File
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.management.base import BaseCommand

from libxmp.utils import file_to_dict
import os
from io import StringIO, BytesIO
from PIL import Image, ImageDraw


from photos.models import *
from django.conf import settings

INPUT_ROOT = os.path.join(settings.BASE_DIR, 'photos', 'load_photos_dir')
print(INPUT_ROOT + '\n\n\n')
if not os.path.isdir(INPUT_ROOT):
    os.makedirs(INPUT_ROOT)


def compute_date(raw_str):
    if raw_str is None:
        return None
    raw_str = str(raw_str)

    date, _ = raw_str.split(' ')
    year, month, day = date.split(':')
    return datetime(int(year), int(month), int(day))


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
    processed_exif_data['make'] = 'Nikon'
    processed_exif_data['model'] = raw_exif_data['Image Model']
    return processed_exif_data


def process_cannon(raw_exif_data):
    processed_exif_data = {}
    processed_exif_data['make'] = str(raw_exif_data['Image Make'])
    processed_exif_data['model'] = str(raw_exif_data['Image Model'])
    return processed_exif_data


def process_noritsu_scanner(raw_exif_data):
    processed_exif_data = {}
    processed_exif_data["make"] = "Film"
    processed_exif_data["model"] = ""
    return processed_exif_data


def process_sony(raw_exif_data):
    model = raw_exif_data['Image Model']
    if model == "SLT-A55V":
        model = 'A55'
    elif model == "DSC-RX100":
        model = "RX100 MKI"
    elif model == "DSLR-A290":
        model = "A290"

    processed_exif_data = {}
    processed_exif_data["make"] = "Sony"
    processed_exif_data["model"] = model
    return processed_exif_data


def process_nexus_5x(raw_exif_data):
    processed_exif_data = {}
    processed_exif_data["make"] = "LG"
    processed_exif_data["model"] = "Nexus"
    return processed_exif_data


def process_moto_x4(raw_exif_data):
    processed_exif_data = {}
    processed_exif_data["make"] = "Motorola"
    processed_exif_data["model"] = "moto x4"
    return processed_exif_data


def process_garbage_metadata(raw_exif_data):
    processed_exif_data = {}
    processed_exif_data["make"] = ""
    processed_exif_data["model"] = ""
    return processed_exif_data


def process_general_raw(raw_exif_data):
    print_raw_keys_and_data(raw_exif_data)
    processed_exif_data = {}

    processed_exif_data["lens"] = str(raw_exif_data.get("EXIF LensModel", ""))
    processed_exif_data["shooting_mode"] = str(raw_exif_data.get("EXIF ExposureProgram", ""))
    processed_exif_data["aperture"] = compute_fractional_string(str(raw_exif_data.get("EXIF FNumber", "")))
    processed_exif_data["shutter_speed"] = str(raw_exif_data.get("EXIF ExposureTime", ""))
    processed_exif_data["iso"] = str(raw_exif_data.get("EXIF ISOSpeedRatings", ""))
    processed_exif_data['focal_length'] = round(
        float(compute_fractional_string(str(raw_exif_data.get('EXIF FocalLength', "0")))), 1)
    processed_exif_data["date_taken"] = compute_date(raw_exif_data.get("EXIF DateTimeOriginal", None))

    return processed_exif_data


def process_exif_data(full_path):
    file_contents = open(full_path, 'rb')

    raw_exif_data = exifread.process_file(file_contents)
    general_processed_exif_data = process_general_raw(raw_exif_data)

    raw_make = str(raw_exif_data.get('Image Make', ''))
    raw_model = str(raw_exif_data.get('Image Model', ''))

    if raw_make in ['NIKON CORPORATION'] and raw_model in ['NIKON D5300', 'NIKON D3400']:
        model_specific_processed_exif_data = process_nikon(raw_exif_data)

    elif raw_make in ['Canon'] and raw_model in ['Canon EOS DIGITAL REBEL XS']:
        model_specific_processed_exif_data = process_cannon(raw_exif_data)

    elif raw_make in ['NORITSU KOKI'] and raw_model in ['QSS-32_33', 'EZ Controller']:
        model_specific_processed_exif_data = process_noritsu_scanner(raw_exif_data)

    elif raw_make in ['SONY'] and raw_model in ['DSC-RX100', 'SLT-A55V', 'DSLR-A290']:
        model_specific_processed_exif_data = process_sony(raw_exif_data)

    elif raw_make in ['LGE'] and raw_model in ['Nexus 5X']:
        model_specific_processed_exif_data = process_nexus_5x(raw_exif_data)

    elif raw_make in ['motorola'] and raw_model in ['moto x4']:
        model_specific_processed_exif_data = process_moto_x4(raw_exif_data)

    elif raw_make == '' and raw_model == '':
        model_specific_processed_exif_data = process_garbage_metadata(raw_exif_data)

    else:
        print('MISSING "{}"{}'.format(raw_make, raw_model))

    processed_exif_data = {**general_processed_exif_data, **model_specific_processed_exif_data}

    im = Image.open(full_path)
    processed_exif_data['width'], processed_exif_data['height'] = im.size

    return processed_exif_data


def create_thumbnail(input_full_path, output_full_path, size):
    im_thumb = Image.open(input_full_path)
    im_thumb.thumbnail(size)
    thumb_io = BytesIO()
    im_thumb.save(thumb_io, format='JPEG')
    thumb_file = InMemoryUploadedFile(
        thumb_io,
        None,
        '_',
        'image/jpeg',
        None,
        None
    )

    return File(
        name=output_full_path,
        file=thumb_file
    )


def get_lightroom_keywords(full_path):
    # FYI: This was annoying to figure out.

    xmp = file_to_dict(full_path)
    # The metadata we want is from http://ns.adobe.com/lightroom/1.0/'
    # There are a bunch of other keys in xmp.keys()
    raw_xmp_data = xmp['http://ns.adobe.com/lightroom/1.0/']

    metadata = {
        'Category': [],
        'Location': '',
        'Gallery': '',
        'ContentType': '',
        'CameraType': '',
    }

    # The first entry is always noise so skip it.
    for entry in raw_xmp_data[1:]:

        # Each keyword gets it's own entry in the list along with a bunch of noise, it is the 2nd element
        keyword = entry[1]
        try:
            key, value = keyword.split('|')
            if key == 'Category':
                metadata['Category'].append(value)
            else:
                metadata[key] = value
        except Exception as e:
            print('Metadata Issue: {}'.format(full_path))
            print(e)
            continue

    return(metadata)


class Command(BaseCommand):
    def handle(self, *args, **options):
        for input_file_name in os.listdir(INPUT_ROOT):
            try:
                input_full_path = os.path.join(INPUT_ROOT, input_file_name)
                input_file_root, file_extension = input_file_name.split('.')

                if file_extension not in ['jpg', 'jpeg']:
                    print('    Skipping file: {}'.format(input_file_name))
                    continue
                else:
                    print('    Processing file: {}'.format(input_file_name))

                lightroom_keywords = get_lightroom_keywords(input_full_path)

                exif_data = process_exif_data(input_full_path)
                if not exif_data:
                    continue

                src = File(
                    name=os.path.join('full', lightroom_keywords['Gallery'], input_file_name),
                    file=open(input_full_path, 'rb')
                )

                small_output_path = os.path.join('small', lightroom_keywords['Gallery'], input_file_name)
                src_thumbnail_small = create_thumbnail(
                    input_full_path, small_output_path, size=(200, 200))

                medium_output_path = os.path.join('medium', lightroom_keywords['Gallery'], input_file_name)
                src_thumbnail_medium = create_thumbnail(
                    input_full_path, medium_output_path, size=(800, 800))

                try:
                    gallery = Gallery.objects.get(title=lightroom_keywords['Gallery'])
                except Gallery.DoesNotExist:
                    gallery = Gallery.objects.create(
                        title=lightroom_keywords['Gallery'],
                        content_type=lightroom_keywords['ContentType']
                    )

                location, _ = Location.objects.get_or_create(
                    title=lightroom_keywords['Location'],
                )

                photo = Photo(
                    # src
                    src=src,
                    src_thumbnail_small=src_thumbnail_small,
                    src_thumbnail_medium=src_thumbnail_medium,

                    # File Details
                    file_name=os.path.join('full', lightroom_keywords['Gallery'], input_file_root),
                    width=exif_data['width'],
                    height=exif_data['height'],
                    gallery=gallery,

                    # Hardware Details
                    make=exif_data['make'],
                    model=exif_data['model'],
                    lens=exif_data['lens'],

                    # Photo Details
                    date_taken=exif_data['date_taken'],
                    shooting_mode=exif_data['shooting_mode'],
                    aperture=exif_data['aperture'],
                    shutter_speed=exif_data['shutter_speed'],
                    iso=exif_data['iso'],
                    focal_length=exif_data['focal_length'],

                    # Lightroom Metadata
                    location=location,
                    camera_type=lightroom_keywords['CameraType'],
                )

                categories = []
                photo.save()
                for c in lightroom_keywords['Category']:
                    category, _ = Category.objects.get_or_create(
                        title=c,
                    )
                    photo.category.add(category)
            except KeyboardInterrupt:
                sys.exit()
