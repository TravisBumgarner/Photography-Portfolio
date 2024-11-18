# About

App For Tagging Photos for Instagram by reading EXIF data from Adobe Lightroom

# Local Setup

1. Get bindings for HTML `canvas` to run in Node - (for Mac) `brew install pkg-config cairo pango libpng jpeg giflib librsvg`
    1. Might need to rebuild canvas - `yarn rebuild canvas`
1. Install yarn dependencies `yarn`

# Adding New Photos

1. Select potential photos by adding them to `01_Potential_Picks`
2. Select selected photos by browsing `02_Potential_Picks_Not_Selected` and adding them to `03_Selected`
3. Add Photo Metadata
    - Add new tags in Lightroom and then add them in `src/tags`
        - Start with `Camera`
        - Then `FilmType`
        - Then the rest of the tags on a per photo basis.
    - Title and describe photos.
        - Descriptions are optional. Try and add a `Photography Tip: ...` where possible (and include the tags). 
        - Write descriptions and use ChatGPT to proofread.
4. Export photos
    - Run this script (`yarn start`)
    - Open Buffer
    - Queue each photo
        - Spellcheck each template
        - Output from template
        - Location
    - Queue photos and move to `04_Queued`
    - Add `Purple` color label. 
5. Once photos are posted
    - Move to `05_Posted`
    
# Setup for New Camera

1. Copy camera name from error message `Error: unsupported cameraDJI - FC3582`
2. Add to SupportedCameras in `types.ts`
3. Add to Switch in `metadataOverride.ts`

# Setup for New Tag

1. Nest tag correctly in Lightrooom. For Example `cameracoffeewander -> Camera -> NikonZ1000`
2. Follow the same hierarchy in Code.
3. Go grab some accounts and tags.

# Setup for New Gallery

1. Nest tag correctly in Lightroom. For Example `PhotographyPortfolioV2 -> Alaska`
2. Add new gallery in galleries.ts using tag. 