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
import colorgram
import os
from io import StringIO, BytesIO
from PIL import Image, ImageDraw


from photos.models import Gallery, Photo
from api_django.settings import MEDIA_ROOT, BASE_DIR


INPUT_ROOT = os.path.join(BASE_DIR, 'photos', 'load_photos_dir')
print(INPUT_ROOT + '\n\n\n')
if not os.path.isdir(INPUT_ROOT):
    os.makedirs(INPUT_ROOT)


PS = "Point & Shoot Camera"
DSLR = "DSLR Camera"
PHONE = "Phone"
FILM = "Film Camera"


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
    processed_exif_data['camera_type'] = DSLR
    processed_exif_data['make'] = 'Nikon'
    processed_exif_data['model'] = raw_exif_data['Image Model']
    return processed_exif_data


def process_cannon(raw_exif_data):
    processed_exif_data = {}
    processed_exif_data['camera_type'] = DSLR
    processed_exif_data['make'] = str(raw_exif_data['Image Make'])
    processed_exif_data['model'] = str(raw_exif_data['Image Model'])
    return processed_exif_data


def process_noritsu_scanner(raw_exif_data):
    processed_exif_data = {}
    processed_exif_data["camera_type"] = FILM
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
    processed_exif_data["camera_type"] = PS
    processed_exif_data["make"] = "Sony"
    processed_exif_data["model"] = model
    return processed_exif_data


def process_nexus_5x(raw_exif_data):
    processed_exif_data = {}
    processed_exif_data["camera_type"] = PHONE
    processed_exif_data["make"] = "LG"
    processed_exif_data["model"] = "Nexus"
    return processed_exif_data


def process_moto_x4(raw_exif_data):
    processed_exif_data = {}
    processed_exif_data["camera_type"] = PHONE
    processed_exif_data["make"] = "Motorola"
    processed_exif_data["model"] = "moto x4"
    return processed_exif_data


def process_garbage_metadata(raw_exif_data):
    processed_exif_data = {}
    processed_exif_data["camera_type"] = PHONE
    processed_exif_data["make"] = ""
    processed_exif_data["model"] = ""
    return processed_exif_data


def process_general_raw(raw_exif_data):
    # print_raw_keys_and_data(raw_exif_data)
    processed_exif_data = {}

    processed_exif_data["lens"] = ""
    processed_exif_data["shooting_mode"] = str(raw_exif_data.get("EXIF ExposureMode", ""))
    processed_exif_data["aperture"] = str(raw_exif_data.get("EXIF FNumber", ""))
    processed_exif_data["shutter_speed"] = str(raw_exif_data.get("EXIF ExposureTime", ""))
    processed_exif_data["iso"] = str(raw_exif_data.get("EXIF ISOSpeedRatings", ""))
    processed_exif_data['focal_length'] = str(raw_exif_data.get('EXIF FocalLength', ""))
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


def get_two_vibrant_color_samples(full_path, generate_preview_image=False):
    basename = os.path.basename(full_path)
    dirname = os.path.dirname(full_path)

    samples = 6
    colors = colorgram.extract(full_path, samples)
    # Most vibrant colors exist
    #   Hue: any
    #   Saturation closest to 100
    #   Luminace: closest to 50
    sorted_colors = sorted(colors, key=lambda c: abs(
        100 - c.hsl.s) + abs(50 - c.hsl.l))

    if generate_preview_image:
        inputImage = Image.open(full_path)
        inputImageWidth, inputImageHeight = inputImage.size
        imageSideRatio = inputImageHeight / inputImageWidth

        width = 100
        height = 100
        totalOutputWidth = width * samples

        outputImageHeight = int(imageSideRatio * totalOutputWidth)
        resizedInputImage = inputImage.resize(
            (totalOutputWidth, outputImageHeight), Image.ANTIALIAS)

        im = Image.new("RGB", (width * 6, height + outputImageHeight), "white")
        draw = ImageDraw.Draw(im)
        im.paste(resizedInputImage, (0, height))

        for index, color in enumerate(sorted_colors):
            print(index, color)
            draw.rectangle(
                [index*100, 0, (index+1)*100, height], fill=color.rgb)

        samples_directory = os.path.join(dirname, 'samples')
        print('samples', samples_directory)
        if not os.path.exists(samples_directory):
            os.mkdir(samples_directory)
        im.save(os.path.join(samples_directory, basename))

    rgb_most_vibrant = 'rgb({},{},{})'.format(
        colors[0].rgb.r, colors[0].rgb.g, colors[0].rgb.b)
    rgb_second_vibrant = 'rgb({},{},{})'.format(
        colors[1].rgb.r, colors[1].rgb.g, colors[1].rgb.b)
    return [rgb_most_vibrant, rgb_second_vibrant]


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

                # color_sample_1, color_sample_2 = get_two_vibrant_color_samples(input_full_path)
                color_sample_1 = 'rgb(0,0,0)'
                color_sample_2 = 'rgb(0,0,0)'

                src = File(
                    name=os.path.join('full', lightroom_keywords['Gallery'], input_file_root),
                    file=open(input_full_path, 'rb')
                )

                small_output_path = os.path.join('small', lightroom_keywords['Gallery'], input_file_root)
                src_thumbnail_small = create_thumbnail(
                    input_full_path, small_output_path, size=(200, 200))

                medium_output_path = os.path.join('medium', lightroom_keywords['Gallery'], input_file_root)
                src_thumbnail_medium = create_thumbnail(
                    input_full_path, medium_output_path, size=(800, 800))

                gallery, _ = Gallery.objects.get_or_create(
                    title=lightroom_keywords['Gallery'],
                    content_type='project'
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

                    # Hardware DEtails
                    camera_type=exif_data['camera_type'],
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
                    location=lightroom_keywords['Location'],
                    categories=', '.join(lightroom_keywords['Category']),

                    # Misc
                    color_sample_1=color_sample_1,
                    color_sample_2=color_sample_2,
                )
                photo.save()
            except KeyboardInterrupt:
                sys.exit()
