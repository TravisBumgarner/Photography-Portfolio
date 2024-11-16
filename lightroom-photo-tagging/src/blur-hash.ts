import { encode } from 'blurhash'
import { createCanvas, loadImage, Image } from 'canvas'

const loadImageNode = async (src: string): Promise<Image> => {
    return loadImage(src)
}

const getImageData = (image: Image) => {
    const canvas = createCanvas(image.width, image.height)
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    return context.getImageData(0, 0, image.width, image.height)
}

export const encodeImageToBlurHash = async (
    imageUrl: string
): Promise<string> => {
    const image = await loadImageNode(imageUrl)
    const imageData = getImageData(image)
    return encode(imageData.data, imageData.width, imageData.height, 4, 4)
}
