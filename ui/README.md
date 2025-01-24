# Setup

1. `yarn` to install dependencies
1. `yarn start` to run locally


# Deployment

1. (Optional) Export `large/` and `thumbnail/` photos from Lightroom. 
1. Run `yarn run deploy:nfs` 
    - Server will **exactly match** what's in `build/`. If `large/` and `thumbnail/` are provided, they too will exactly match the server.