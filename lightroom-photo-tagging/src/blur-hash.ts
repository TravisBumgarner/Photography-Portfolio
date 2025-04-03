import { encode } from 'blurhash'
import { createCanvas, Image, loadImage } from 'canvas'

const getImageData = (image: Image) => {
    const canvas = createCanvas(image.width, image.height)
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    return context.getImageData(0, 0, image.width, image.height)
}

export const encodeImageToBlurHash = async (
    filePath: string
): Promise<{ blurHash: string; width: number; height: number }> => {
    console.log('filePath', filePath)
    const image = await loadImage(filePath)

    // faster processing by using a smaller image
    const imagePath = filePath.replace('large', 'thumbnail')
    const smallImage = await loadImage(imagePath)

    const imageData = getImageData(smallImage)
    return {
        blurHash: encode(imageData.data, imageData.width, imageData.height, 4, 4),
        width: image.width,
        height: image.height,
    }
}
