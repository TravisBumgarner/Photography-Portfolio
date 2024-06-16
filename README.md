# Setup

1. [Install GCloud CLI](https://cloud.google.com/sdk/docs/install)  and `gcloud auth login`
2. Now you can deploy

# Lightroom

1. Add Metadata to Photos:

```
Categories
- Nature
- Street
- Architecture
- Black & White
- Landscapes
- Abstract
- People
IsHomepage
Gallery
- 2x3x4
- 2018
Location
- CountryNameHere
CameraType
- Digital
- Analog
ContentType
- snapshot
- project
IsBackgroundPhoto (Check for True)
```

2. Export Settings: (Check all 3)

  - `To Portfolio - Thumbnail`:
    - Resize 600 pixels short side
    - Quality: 100%
    - Sharpen for screen standard
    - Disable `Write Keywords as Lightroom Hierarchy`
    - output dir: `thumbnails`
  - `To Portfolio - Large`:
    - Resize 2000 x 2000 pixels
    - Quality: 100%
    - Sharpen for screen standard
    - Don't enlarge
    - Enable `Write Keywords as Lightroom Hierarchy`
    - output dir: `large`

3. Copy `large` directory to `./load_photos`
4. `yarn` Install dependencies
5. `yarn start` run script
6. Navigate to https://console.cloud.google.com/
7. Drag and drop `large` and `thumbnail` into GCS
11. `yarn deploy` `ui`



