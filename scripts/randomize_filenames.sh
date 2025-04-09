#!/bin/bash

# Directory containing the files
TARGET_DIR="~/Desktop/cameracoffeewander_template_ingest"  # Change this to your target directory if needed

# Change to the target directory
cd "$TARGET_DIR" || exit 1

# Loop through all files (skip directories)
for file in *; do
  if [[ -f "$file" ]]; then
    # Get the file extension (including the dot, if present)
    extension="${file##*.}"
    if [[ "$file" == "$extension" ]]; then
      extension=""
    else
      extension=".$extension"
    fi

    # Generate a random filename (UUID-style)
    new_name="$(uuidgen)$extension"

    # Rename the file
    mv "$file" "$new_name"
    echo "Renamed $file → $new_name"
  fi
done