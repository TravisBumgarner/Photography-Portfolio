import os
import sys
import shutil

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

    if not os.path.isdir(INPUT_ROOT):
        os.makedirs(INPUT_ROOT)

    for input_file_name in os.listdir(INPUT_ROOT):
        # try:
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

        # try:
        #     gallery = Gallery.objects.get(title=lightroom_keywords["Gallery"])
        # except Gallery.DoesNotExist:
        #     gallery = Gallery.objects.create(
        #         title=lightroom_keywords["Gallery"],
        #         content_type=lightroom_keywords["ContentType"],
        #     )

        # location, _ = Location.objects.get_or_create(
        #     title=lightroom_keywords["Location"],
        # )
        print(exif_data)
        photo = {
            # src
            # src: src,
            # src_thumbnail_small: src_thumbnail_small,
            # src_thumbnail_medium: src_thumbnail_medium,
            # File Details
            # file_name=os.path.join(
            #     "full", lightroom_keywords["Gallery"], input_file_root
            # ),
            # width: exif_data["width"],
            # height: exif_data["height"],
            # gallery: gallery,
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

        # categories = []
        # photo.save()
        # for c in lightroom_keywords["Category"]:
        #     category, _ = Category.objects.get_or_create(title=c,)
        #     photo.category.add(category)
        print(photo)
        # except Exception as e:
        #     print(e)
        #     print("Messed up on photo", input_file_name)


if __name__ == "__main__":
    main()
