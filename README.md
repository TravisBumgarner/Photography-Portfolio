# Django

`source ../lib/venv/bin/activate`
`python manage.py load_photos`
Login to admin panel and set content_type, dates, description

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
