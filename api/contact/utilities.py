from .config import PUSHOVER_APP_TOKEN, PUSHOVER_USER_KEY
import http.client
import urllib


def send(message):
    conn = http.client.HTTPSConnection("api.pushover.net:443")
    conn.request("POST", "/1/messages.json",
                 urllib.parse.urlencode({
                     "token": PUSHOVER_APP_TOKEN,
                     "user": PUSHOVER_USER_KEY,
                     "message": message,
                 }), {"Content-type": "application/x-www-form-urlencoded"})
    r = conn.getresponse()
    return r
