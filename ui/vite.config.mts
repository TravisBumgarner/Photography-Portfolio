import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { type Plugin, defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// The exported photos live on the Desktop, outside the repo. In production the
// app requests them at /large/<file> and /thumbnail/<file> (see getPhotoUrl).
const PHOTO_DIRS: Record<string, string> = {
  '/large/': path.join(os.homedir(), 'Desktop/large'),
  '/thumbnail/': path.join(os.homedir(), 'Desktop/thumbnail')
}
const PROD_PHOTO_HOST = 'https://travisbumgarner.photography'

// Default dev mode: serve the photos straight from ~/Desktop so /large/* and
// /thumbnail/* resolve locally without copying anything into the repo.
const serveLocalPhotos = (): Plugin => ({
  name: 'serve-local-photos',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = decodeURIComponent((req.url ?? '').split('?')[0])
      const prefix = Object.keys(PHOTO_DIRS).find(p => url.startsWith(p))
      if (prefix === undefined) return next()

      const filePath = path.join(PHOTO_DIRS[prefix], url.slice(prefix.length))
      if (!filePath.startsWith(PHOTO_DIRS[prefix])) {
        res.statusCode = 403
        return res.end('Forbidden')
      }

      fs.stat(filePath, (err, stat) => {
        if (err !== null || !stat.isFile()) {
          res.statusCode = 404
          return res.end('Not found')
        }
        res.setHeader('Content-Type', 'image/avif')
        fs.createReadStream(filePath).pipe(res)
      })
    })
  }
})

// `PHOTO_SOURCE=prod yarn dev` (yarn dev:prod-photos) instead proxies the photo
// requests to the live site, so you can run the dev server with no local export.
const usingProdPhotos = process.env.PHOTO_SOURCE === 'prod'

export default defineConfig({
  plugins: [react(), tsconfigPaths(), ...(usingProdPhotos ? [] : [serveLocalPhotos()])],
  server: {
    port: 3000,
    ...(usingProdPhotos
      ? {
          proxy: {
            '/large': { target: PROD_PHOTO_HOST, changeOrigin: true },
            '/thumbnail': { target: PROD_PHOTO_HOST, changeOrigin: true }
          }
        }
      : {})
  },
  build: {
    outDir: 'build',
    emptyOutDir: true
  }
})
