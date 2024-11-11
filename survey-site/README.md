# Adding Photos

1. Export photos 1 -> n with a unique key to prefix the number from Lightroom (`arizona2.jpg` for example) using `Survey Site` template
1. Upload photos to https://console.cloud.google.com/storage/browser/photo-survey
1. Update `generateImageUrls` call in App.tsx with photo count and unique key.
1. Deploy site
1. Seek feedback 🍀
