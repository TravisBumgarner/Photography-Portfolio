import os
from PIL import Image
from PIL.ExifTags import TAGS
from pprint import pprint


def main():
    INPUT_ROOT = os.path.abspath("./large")

    for dir in [INPUT_ROOT, "./output_json"]:
        if not os.path.isdir(dir):
            os.makedirs(dir)

    for file in os.listdir(INPUT_ROOT):
        img=Image.open(os.path.join(INPUT_ROOT, file))
        
        exif_table={}
        for k, v in img.getexif().items():
            tag=TAGS.get(k)
            exif_table[tag]=v
        pprint(exif_table)



if __name__ == "__main__":
    main()
