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
```

2. Export Settings:

  - Thumbnails:
    - Resize 400 x 400 pixels
    - Quality: 50%
    - Sharpen for screen standard
    - Disable `Write Keywords as Lightroom Hierarchy`
    - output directory: `thumbnails`
  - Large:
    - Resize 1200 x 1200 pixels
    - Quality: 80%
    - Sharpen for screen standard
    - Don't enlarge
    - Enable `Write Keywords as Lightroom Hierarchy`
    - output directory: `large`

2. Export to directory with
  - file naming options `Date (YYYY)_Folder Name_Sequence # (001)` (Select `Date(YYYY)`, `Folder Name`, and `Sequence # (001)` because screw lightroom can't copy and paste the format)

3. Upload to AWS

# React

## Update UI

1. Make changes
2. Build bundle `npm run bundle`
3. List Services `pm2 list`
4. Restart Desired Service `pm2 restart service-name.js`

## Sentry

1. Create new project
2. Use [code](https://github.com/TravisBumgarner/photo20/blob/master/ui/src/index.js) as example 

# Python 

1. Install exempi `brew install exempi` 

# Django

# Update API

1. Make Changes
2. Restart gunicorn `sudo systemctl restart gunicorn`

# Sentry
1. Add snippet of code in `settings.py`
2. Restart gunicorn `sudo systemctl restart gunicorn`

# HTTPS

[Tutorial
](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04)

# Nginx

1. Make changes in `/etc/nginx/sites-available` *with `sudo`*
2. If not symlinked, link changes from `sites-available` to `sites-enabled`
3. Restart `sudo service nginx restart`

# Gunicorn

Services live in `/etc/systemd/system/project_api.service`

## Create

1. `sudo systemctl start service_name`
2. `sudo systemctl enable service_name`

## Status

1. `sudo systemctl status service_name`

