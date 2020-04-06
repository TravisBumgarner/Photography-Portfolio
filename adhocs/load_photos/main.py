import os
import sys
import shutil
import json
import uuid
from slugify import slugify

# from io import StringIO, BytesIO

from libxmp.utils import file_to_dict

from libxmp.utils import file_to_dict
import os

# from io import StringIO, BytesIO
# from PIL import Image, ImageDraw

from exif import process_exif_data


# def create_thumbnail(input_full_path, output_full_path, size):
#     im_thumb = Image.open(input_full_path)
#     im_thumb.thumbnail(size)
#     thumb_io = BytesIO()
#     im_thumb.save(thumb_io, format="JPEG")
#     thumb_file = InMemoryUploadedFile(thumb_io, None, "_", "image/jpeg", None, None)

#     return File(name=output_full_path, file=thumb_file)


def get_lightroom_keywords(full_path):
    # FYI: This was annoying to figure out.

    xmp = file_to_dict(full_path)
    # The metadata we want is from http://ns.adobe.com/lightroom/1.0/'
    # There are a bunch of other keys in xmp.keys()
    raw_xmp_data = xmp["http://ns.adobe.com/lightroom/1.0/"]

    metadata = {
        "Category": [],
        "Location": "",
        "Gallery": "",
        "ContentType": "",
        "CameraType": "",
    }

    # The first entry is always noise so skip it.
    for entry in raw_xmp_data[1:]:

        # Each keyword gets it's own entry in the list along with a bunch of noise, it is the 2nd element
        keyword = entry[1]
        try:
            key, value = keyword.split("|")
            if key == "Category":
                metadata["Category"].append(value)
            else:
                metadata[key] = value
        except Exception as e:
            print("Metadata Issue: {}".format(full_path))
            print(e)
            continue

    return metadata


def main():
    INPUT_ROOT = os.path.abspath("./input_photos")
    print(INPUT_ROOT + "\n\n\n")

    for dir in [INPUT_ROOT, "./output_photos", "./output_json"]:
        if not os.path.isdir(dir):
            os.makedirs(dir)

    photos = []
    categories = set([])
    galleries = {}
    locations = set([])

    for input_file_name in os.listdir(INPUT_ROOT):
        try:
            input_full_path = os.path.join(INPUT_ROOT, input_file_name)
            input_file_root, file_extension = input_file_name.split(".")

            if file_extension not in ["jpg", "jpeg"]:
                print("    Skipping file: {}".format(input_file_name))
                continue
            else:
                print("    Processing file: {}".format(input_file_name))

            lightroom_keywords = get_lightroom_keywords(input_full_path)

            exif_data = process_exif_data(input_full_path)
            if not exif_data:
                continue

            if lightroom_keywords["Gallery"] not in galleries:
                galleries[lightroom_keywords["Gallery"]] = {
                    "title": lightroom_keywords["Gallery"],
                    "slug": slugify(lightroom_keywords["Gallery"]),
                    "content_type": lightroom_keywords["ContentType"],
                }

            locations.add(lightroom_keywords["Location"])

            categories.update(lightroom_keywords["Category"])

            photo = {
                "id": str(uuid.uuid4()),
                "src": input_file_name,
                "gallery": galleries[lightroom_keywords["Gallery"]]
                "categories": lightroom_keywords["Category"],
                # Hardware Details
                "make": exif_data["make"],
                "model": exif_data["model"],
                "lens": exif_data["lens"],
                # Photo Details
                "date_taken": exif_data["date_taken"],
                "shooting_mode": exif_data["shooting_mode"],
                "aperture": exif_data["aperture"],
                "shutter_speed": exif_data["shutter_speed"],
                "iso": exif_data["iso"],
                "focal_length": exif_data["focal_length"],
                # Lightroom Metadata
                "location": lightroom_keywords["Location"],
                "camera_type": lightroom_keywords["CameraType"],
            }

            photos.append(photo)
        except Exception as e:
            print(e)
            print("Messed up on photo", input_file_name)

        with open("output_json/photos.json", "w") as outfile:
            json.dump(photos, outfile, default=str)

        with open("output_json/galleries.json", "w") as outfile:
            json.dump(list(galleries.values()), outfile)

        with open("output_json/locations.json", "w") as outfile:
            json.dump(list(locations), outfile)

        with open("output_json/categories.json", "w") as outfile:
            json.dump(list(categories), outfile)


if __name__ == "__main__":
    main()
