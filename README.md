# Add Content

## Lightroom:

1. Add Metadata to Photos:
```Categories
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
- Snapshot
- Project```
2. Export to directory to load photos. 

# Django

`source ../lib/venv/bin/activate`
Login to admin panel and create Project if it doesn't already exist. Update metadata as needed. 
`python manage.py load_photos`

# Updating UI

from within photo20/ui
git pull
`../bin_node/stop`
`../bin_node/npm run bundle`
`../bin_node/start`

# Updating API

`git pull`
`source ../lib/venv/bin/activate`
Make changes
`./apache2/bin/stop`
`./apache2/bin/start`
