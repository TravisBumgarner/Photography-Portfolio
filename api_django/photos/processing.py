# TODO: 
#    - Add Width and height
#    - Add flash

import os
import shutil
from datetime import datetime

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
    processed_exif_data['model']            = "N/A"
    processed_exif_data['lens']             = "N/A"
    processed_exif_data['date_taken']       = "N/A"
    processed_exif_data['shooting_mode']     = "N/A"
    processed_exif_data['aperature']        = "N/A"
    processed_exif_data['shutter_speed']    = "N/A"
    processed_exif_data['iso']              = "N/A"
    
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
    processed_exif_data['lens']             = "N/A"
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
    processed_exif_data['lens']             = "N/A"
    processed_exif_data['date_taken']       = compute_date(str(raw_exif_data['EXIF DateTimeOriginal']))
    processed_exif_data['shooting_mode']    = str(raw_exif_data['EXIF ExposureMode'])
    processed_exif_data['aperature']        = str(raw_exif_data['EXIF FNumber'])
    processed_exif_data['shutter_speed']    = str(raw_exif_data['EXIF ExposureTime'])
    processed_exif_data['iso']              = str(raw_exif_data['EXIF ISOSpeedRatings'])
    
    return processed_exif_data


def process_exif_data(f):
        processed_exif_data = {}
        raw_exif_data = exifread.process_file(f)
        
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
        
        return processed_exif_data

if __name__ == "__main__":
    input_directory = '/Users/travisbumgarner/Documents/programming/temp/exif_processing/test_images'
    output_directory = '/Users/travisbumgarner/Documents/programming/temp/exif_processing/test_images_processed'

    for f in os.listdir(input_directory):
        _, extension = f.split('.')
        if extension not in ['jpg', 'jpeg']:
            print('[-] Skipping invalid file type {}'.format(f))
            continue

        try:
            exif_data = process_exif_data(open(os.path.join(input_directory, f),'rb'))
            
            print(f)
            for k in exif_data:
                print('    {}: {}'.format(k, exif_data[k]))

            # shutil.move(os.path.join(input_directory, f), os.path.join(output_directory, f))
        except Exception as e:
            print(e)
            print('[-] Error encountered with {}'.format(f))
            continue
