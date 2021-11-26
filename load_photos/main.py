import os
import sys
import shutil
import json
import uuid
from slugify import slugify
from libxmp.utils import file_to_dict

from exif import process_exif_data


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
        "IsBackgroundPhoto": False,
    }

    # The first entry is always noise so skip it.
    for entry in raw_xmp_data[1:]:

        # Each keyword gets it's own entry in the list along with a bunch of noise, it is the 2nd element
        keyword = entry[1]
        try:
            if keyword == "IsBackgroundPhoto":
                metadata["IsBackgroundPhoto"] = True
            else:
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
    OUTPUT_ROOT = os.path.abspath("../ui/src/App/")
    print(INPUT_ROOT + "\n\n\n")

    for dir in [INPUT_ROOT, "./output_json"]:
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
                "gallery": galleries[lightroom_keywords["Gallery"]],
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
                "focal_length": f'{exif_data["focal_length"]}',
                # Lightroom Metadata
                "location": lightroom_keywords["Location"],
                "camera_type": lightroom_keywords["CameraType"],
                "is_home_background": lightroom_keywords["IsBackgroundPhoto"],
            }

            photos.append(photo)
        except Exception as e:
            print(e)
            print("Messed up on photo", input_file_name)

    output = {
        "photos": photos,
        "galleries": list(galleries.values()),
        "locations": list(locations),
        "categories": list(categories),
    }
    ui_app_path = os.path.join(OUTPUT_ROOT, "output.json")
    print(ui_app_path)
    with open(ui_app_path, "w") as outfile:
        json.dump(output, outfile, default=str)


if __name__ == "__main__":
    main()
