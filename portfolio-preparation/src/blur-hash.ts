import { encode } from 'blurhash'
import sharp from 'sharp'

export const encodeImageToBlurHash = async (
  filePath: string
): Promise<{ blurHash: string; width: number; height: number }> => {
  // Full-resolution dimensions come from the large export.
  const { width = 0, height = 0 } = await sharp(filePath).rotate().metadata()

  // The blurhash is computed from the smaller thumbnail export for speed.
  const thumbnailPath = filePath.replace('large', 'thumbnail')
  const { data, info } = await sharp(thumbnailPath)
    .rotate()
    .raw()
    .ensureAlpha()
    .resize(64, 64, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true })

  const blurHash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4)

  return { blurHash, width, height }
}
