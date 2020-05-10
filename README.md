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
    - Resize 400 pixels short side
    - Quality: 50%
    - Sharpen for screen standard
    - Disable `Write Keywords as Lightroom Hierarchy`
    - output directory: `thumbnails`
  - `To Portfolio - Large`:
    - Resize 1200 x 1200 pixels
    - Quality: 80%
    - Sharpen for screen standard
    - Don't enlarge
    - Enable `Write Keywords as Lightroom Hierarchy`
    - output directory: `large`
  - `To Portfolio - input_photos`
    - output directory: `load_photos`

3. Copy `load_photos` dir to Python script and run script.

4. Upload photos & Code to GCS bucket. 
Drag and drop `large` and `thumbnail` into GCS
`npm run deploy`




