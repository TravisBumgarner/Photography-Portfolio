import os
import shutil

source_folder = "/Users/travisbumgarner/Dropbox"

# Destination folder for exported photos
destination_folder = "/Users/travisbumgarner/Pictures/exported"


def move_exported_photos(src, dst):
    for root, dirs, files in os.walk(src):
        for file in files:
            if "_exported_for_viewing_locally" in file:
                source_path = os.path.join(root, file)
                # Get the relative path within the source folder
                relative_path = os.path.relpath(source_path, src)
                destination_path = os.path.join(dst, relative_path)
                destination_dir = os.path.dirname(destination_path)

                # Create the destination directory if it doesn't exist
                os.makedirs(destination_dir, exist_ok=True)

                shutil.move(source_path, destination_path)
                print(f"Moved: {source_path} to {destination_path}")


# Create the destination folder if it doesn't exist
if not os.path.exists(destination_folder):
    os.makedirs(destination_folder)

# Call the function to move exported photos
move_exported_photos(source_folder, destination_folder)
