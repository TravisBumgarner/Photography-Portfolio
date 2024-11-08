# Setup

1. [Install GCloud CLI](https://cloud.google.com/sdk/docs/install)  and `gcloud auth login`
2. Now you can deploy

# Lightroom

1. Add Metadata to Photos:

```
Photos should match to one of the galleries listed in `lightroom-photo-tagging/main-portfolio-metadata.ts/TAG_TO_GALLERY_LOOKUP`
```

1. Export Settings: (Check all 3)

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

1. Copy `large` directory to `/Users/travisbumgarner/Desktop/large`
1. `yarn` Install dependencies
1. `yarn start` run script
1. Navigate to https://console.cloud.google.com/
1. Drag and drop `large` and `thumbnail` into GCS
1. Copy output of `main-portfolio-metadata.ts` to `ui/src/App/content/` and update index.ts in that dir.
1. `yarn deploy` `ui`



