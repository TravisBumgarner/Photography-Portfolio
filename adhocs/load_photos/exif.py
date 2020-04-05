import exifread
from datetime import datetime


def compute_fractional_string(raw_str):
    if "/" not in raw_str:
        return raw_str

    numerator, denominatior = raw_str.split("/")
    return str(float(numerator) / float(denominatior))


def compute_date(raw_str):
    if raw_str is None:
        return None
    raw_str = str(raw_str)

    date, _ = raw_str.split(" ")
    year, month, day = date.split(":")
    return datetime(int(year), int(month), int(day))


def print_raw_keys_and_data(raw_exif_data):
    for k in raw_exif_data.keys():
        if k == "JPEGThumbnail":
            continue
        print(k, raw_exif_data[k])


def process_nikon(raw_exif_data):
    processed_exif_data = {}
    _, model = str(raw_exif_data["Image Model"]).split(" ")
    processed_exif_data["make"] = "Nikon"
    processed_exif_data["model"] = raw_exif_data["Image Model"]
    return processed_exif_data


def process_cannon(raw_exif_data):
    processed_exif_data = {}
    processed_exif_data["make"] = str(raw_exif_data["Image Make"])
    processed_exif_data["model"] = str(raw_exif_data["Image Model"])
    return processed_exif_data


def process_noritsu_scanner(raw_exif_data):
    processed_exif_data = {}
    processed_exif_data["make"] = "Film"
    processed_exif_data["model"] = ""
    return processed_exif_data


def process_sony(raw_exif_data):
    model = raw_exif_data["Image Model"]
    if model == "SLT-A55V":
        model = "A55"
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
    processed_exif_data["shooting_mode"] = str(
        raw_exif_data.get("EXIF ExposureProgram", "")
    )
    processed_exif_data["aperture"] = compute_fractional_string(
        str(raw_exif_data.get("EXIF FNumber", ""))
    )
    processed_exif_data["shutter_speed"] = str(
        raw_exif_data.get("EXIF ExposureTime", "")
    )
    processed_exif_data["iso"] = str(raw_exif_data.get("EXIF ISOSpeedRatings", ""))
    processed_exif_data["focal_length"] = round(
        float(
            compute_fractional_string(str(raw_exif_data.get("EXIF FocalLength", "0")))
        ),
        1,
    )
    processed_exif_data["date_taken"] = compute_date(
        raw_exif_data.get("EXIF DateTimeOriginal", None)
    )

    return processed_exif_data


def process_exif_data(full_path):
    file_contents = open(full_path, "rb")

    raw_exif_data = exifread.process_file(file_contents)
    general_processed_exif_data = process_general_raw(raw_exif_data)

    raw_make = str(raw_exif_data.get("Image Make", ""))
    raw_model = str(raw_exif_data.get("Image Model", ""))

    if raw_make in ["NIKON CORPORATION"] and raw_model in [
        "NIKON D5300",
        "NIKON D3400",
    ]:
        model_specific_processed_exif_data = process_nikon(raw_exif_data)

    elif raw_make in ["Canon"] and raw_model in ["Canon EOS DIGITAL REBEL XS"]:
        model_specific_processed_exif_data = process_cannon(raw_exif_data)

    elif raw_make in ["NORITSU KOKI"] and raw_model in ["QSS-32_33", "EZ Controller"]:
        model_specific_processed_exif_data = process_noritsu_scanner(raw_exif_data)

    elif raw_make in ["SONY"] and raw_model in ["DSC-RX100", "SLT-A55V", "DSLR-A290"]:
        model_specific_processed_exif_data = process_sony(raw_exif_data)

    elif raw_make in ["LGE"] and raw_model in ["Nexus 5X"]:
        model_specific_processed_exif_data = process_nexus_5x(raw_exif_data)

    elif raw_make in ["motorola"] and raw_model in ["moto x4"]:
        model_specific_processed_exif_data = process_moto_x4(raw_exif_data)

    elif raw_make == "" and raw_model == "":
        model_specific_processed_exif_data = process_garbage_metadata(raw_exif_data)

    elif raw_make == "Google" and raw_model == "Pixel 3":
        model_specific_processed_exif_data = process_garbage_metadata(raw_exif_data)
    else:
        print('MISSING "{}"{}'.format(raw_make, raw_model))

    processed_exif_data = {
        **general_processed_exif_data,
        **model_specific_processed_exif_data,
    }

    # im = Image.open(full_path)
    # processed_exif_data["width"], processed_exif_data["height"] = im.size

    return processed_exif_data
