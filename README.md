# Add Content

## Lightroom:

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
- Snapshot
- Project
```

2. Export to directory with file naming options `Date (YYYY)_Folder Name_Sequence # (001)`
3. Zip directory
4. Upload via Cyberduck

# Django

`source ../lib/venv/bin/activate`
Login to admin panel and create Project if it doesn't already exist. Update metadata as needed.
`SITE=production python manage.py load_photos`

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

# GAHHH 🤷🤷🤷🤷🤷🤷🤷

To use xmp library on Webfaction:

1. Follow these instructions: https://docs.webfaction.com/software/home-install.html
2. With a `wget` of the tar.bz2 here: https://libopenraw.freedesktop.org/wiki/Exempi/
3. Then modify virtualenv `site-packages/libxmp/exempi.py` with the following:

```
def _load_exempi():
"""
Loads exempi library.
"""
path = '/home/tbumgarner/lib/libexempi.so'
#path = ctypes.util.find_library('exempi')
#if path is None: # if platform.system().startswith('Darwin'): # if os.path.exists('/opt/local/lib/libexempi.dylib'): # # MacPorts starndard location. # path = '/opt/local/lib/libexempi.dylib'
if path is None:
raise ExempiLoadError('Exempi library not found.')

    if os.name != "nt":
        EXEMPI = ctypes.CDLL(path)
    else:
        EXEMPI = ctypes.WinDLL(path)

    return EXEMPI

EXEMPI = \_load_exempi()
```
