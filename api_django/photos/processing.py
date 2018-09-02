# TODO: 
#    - Add Width and height
#    - Add flash

import os

import exifread

def print_raw_keys_and_data(raw_exif_data):
    for k in raw_exif_data.keys():
        if k == 'JPEGThumbnail':
            continue
        print(k, raw_exif_data[k])


def compute_fractional_string(raw_str):
    numerator, denominatior = raw_str.split('/')
    return str(float(numerator) / float(denominatior))

def process_nikon(raw_exif_data):
    processed_exif_data = {}

    _, model = str(raw_exif_data['Image Model']).split(' ')

    processed_exif_data['camera_type']      = "DSLR"
    processed_exif_data['make']             = 'Nikon'
    processed_exif_data['model']            = str(model)
    processed_exif_data['lens']             = str(raw_exif_data['EXIF LensModel'])
    processed_exif_data['date_taken']       = str(raw_exif_data['Image DateTime'])
    processed_exif_data['shooting_mode']     = str(raw_exif_data['EXIF ExposureProgram'])
    processed_exif_data['aperature']        = compute_fractional_string(str(raw_exif_data['EXIF FNumber']))
    processed_exif_data['shutter_speed']    = str(raw_exif_data['EXIF ExposureTime'])
    processed_exif_data['iso']              = str(raw_exif_data['EXIF SensitivityType'])
    
    return processed_exif_data

def process_noritsu_scanner(raw_exif_data):
    print('process scanner')
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
    print('process rx100')
    processed_exif_data = {}

    processed_exif_data['camera_type']      = "P&S"
    processed_exif_data['make']             = "Sony"
    processed_exif_data['model']            = "RX100 MKI"
    processed_exif_data['lens']             = raw_exif_data['EXIF LensModel']
    processed_exif_data['date_taken']       = raw_exif_data['EXIF DateTimeOriginal']
    processed_exif_data['shooting_mode']    = raw_exif_data['EXIF ExposureProgram']
    processed_exif_data['aperature']        = raw_exif_data['EXIF FNumber']
    processed_exif_data['shutter_speed']    = raw_exif_data['EXIF ExposureTime']
    processed_exif_data['iso']              = raw_exif_data['EXIF ISOSpeedRatings']
    
    return processed_exif_data

def process_nexus_5x(raw_exif_data):
    print('process 5x')
    processed_exif_data = {}

    processed_exif_data['camera_type']      = "Phone"
    processed_exif_data['make']             = "LG"
    processed_exif_data['model']            = "Nexus"
    processed_exif_data['lens']             = "N/A"
    processed_exif_data['date_taken']       = raw_exif_data['EXIF DateTimeOriginal']
    processed_exif_data['shooting_mode']    = raw_exif_data['EXIF ExposureMode']
    processed_exif_data['aperature']        = raw_exif_data['EXIF FNumber']
    processed_exif_data['shutter_speed']    = raw_exif_data['EXIF ExposureTime']
    processed_exif_data['iso']              = raw_exif_data['EXIF ISOSpeedRatings']
    
    return processed_exif_data

def process_moto_x4(raw_exif_data):
    print('process 5x')
    processed_exif_data = {}

    processed_exif_data['camera_type']      = "Phone"
    processed_exif_data['make']             = "Motorola"
    processed_exif_data['model']            = "moto x4"
    processed_exif_data['lens']             = "N/A"
    processed_exif_data['date_taken']       = raw_exif_data['EXIF DateTimeOriginal']
    processed_exif_data['shooting_mode']    = raw_exif_data['EXIF ExposureMode']
    processed_exif_data['aperature']        = raw_exif_data['EXIF FNumber']
    processed_exif_data['shutter_speed']    = raw_exif_data['EXIF ExposureTime']
    processed_exif_data['iso']              = raw_exif_data['EXIF ISOSpeedRatings']
    
    return processed_exif_data


def process_file(f):
        processed_exif_data = {}
        raw_exif_data = exifread.process_file(f)
        
        try:
            raw_make = str(raw_exif_data['Image Make'])
            raw_model = str(raw_exif_data['Image Model'])
        
        except KeyError:
            print('{} has no make or model'.format(f))
            return None
            
        if raw_make in ['NIKON CORPORATION'] and raw_model in ['NIKON D5300', 'NIKON D3400']:
            processed_exif_data = process_nikon(raw_exif_data)
        
        elif raw_make in ['NORITSU KOKI'] and raw_model in ['QSS-32_33', 'EZ Controller']:
            process_noritsu_scanner(raw_exif_data)

        elif raw_make in ['SONY'] and raw_model in ['DSC-RX100']:
            process_sony_rx100(raw_exif_data)
        
        elif raw_make in ['LGE'] and raw_model in ['Nexus 5X']:
            process_nexus_5x(raw_exif_data)
        
        elif raw_make in ['motorola'] and raw_model in ['moto x4']:
            process_moto_x4(raw_exif_data)
        
        # else:
        #     raise KeyError('[-] MAKE/MODEL ERROR: {} - {} Not found'.format(raw_make,raw_model))

if __name__ == "__main__":
    directories = [
        '/Users/travisbumgarner/Documents/programming/temp/exif_processing/test_images',
    ]

    for directory in directories:
        for f in os.listdir(directory):
            process_file(open(os.path.join(directory, f),'rb'))

