import path from 'path'

import fs from 'fs'

// Interface for the folder structure
interface PhotoFolder {
  title: string
  slug: string
  photos: string[]
  subfolders?: PhotoFolder[]
}

// Utility function to convert folder name to URL-friendly slug
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Utility function to convert slugged folder name back to human-readable title
function fromSlug(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Function to check if a file is an image
function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff', '.tif', '.avif']
  const ext = path.extname(filename).toLowerCase()
  return imageExtensions.includes(ext)
}

// Recursive function to read directory structure
function readPhotoDirectory(dirPath: string, relativePath: string = ''): PhotoFolder | null {
  try {
    const stats = fs.statSync(dirPath)

    if (!stats.isDirectory()) {
      return null
    }

    const items = fs.readdirSync(dirPath)
    const folderName = path.basename(dirPath)

    const photos: string[] = []
    const subfolders: PhotoFolder[] = []

    for (const item of items) {
      const itemPath = path.join(dirPath, item)
      const itemStats = fs.statSync(itemPath)

      if (itemStats.isFile() && isImageFile(item)) {
        // Store relative path from the input directory
        const photoRelativePath = path.join(relativePath, item)
        photos.push(photoRelativePath)
      } else if (itemStats.isDirectory()) {
        const subfolder = readPhotoDirectory(itemPath, path.join(relativePath, item))
        if (subfolder) {
          subfolders.push(subfolder)
        }
      }
    }

    // Only include folders that have photos or subfolders with photos
    if (photos.length === 0 && subfolders.length === 0) {
      return null
    }

    const folder: PhotoFolder = {
      title: fromSlug(folderName), // Convert slug back to human-readable title
      slug: folderName, // Keep the original folder name as the slug
      photos: photos.sort() // Sort photos alphabetically
    }

    if (subfolders.length > 0) {
      folder.subfolders = subfolders.sort((a, b) => a.title.localeCompare(b.title))
    }

    return folder
  } catch (error) {
    throw new Error(`Error reading directory ${dirPath}: ${error}`)
  }
}

// Main function to generate the photo structure
function generatePhotoStructure(inputDir: string = 'input'): PhotoFolder[] {
  const inputPath = path.resolve(inputDir)

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input directory "${inputPath}" does not exist.`)
  }

  try {
    const items = fs.readdirSync(inputPath)
    const photoFolders: PhotoFolder[] = []

    for (const item of items) {
      const itemPath = path.join(inputPath, item)
      const itemStats = fs.statSync(itemPath)

      if (itemStats.isDirectory()) {
        const folder = readPhotoDirectory(itemPath, item)
        if (folder) {
          photoFolders.push(folder)
        }
      }
    }

    return photoFolders.sort((a, b) => a.title.localeCompare(b.title))
  } catch (error) {
    throw new Error(`Error reading input directory: ${error}`)
  }
}

// Function to save the structure to a JSON file
function savePhotoStructure(
  outputFile: string = './src/photo-structure.json',
  inputDir: string = 'input'
): PhotoFolder[] {
  const structure = generatePhotoStructure(inputDir)

  try {
    const jsonOutput = JSON.stringify(structure, null, 2)
    fs.writeFileSync(outputFile, jsonOutput, 'utf8')
    return structure
  } catch (error) {
    throw new Error(`Error saving photo structure: ${error}`)
  }
}

// Export functions for use in other modules
export { fromSlug, generatePhotoStructure, savePhotoStructure, toSlug, type PhotoFolder }

/* eslint-disable no-console */

// CLI script to generate photo structure
async function main() {
  const inputDir = './public'
  const outputFile = './src/photo-structure.json'

  console.log(`Reading photos from: ${path.resolve(inputDir)}`)
  console.log(`Output file: ${outputFile}`)

  try {
    const structure = savePhotoStructure(outputFile, inputDir)
    console.log(`Photo structure saved to ${outputFile}`)
    console.log(`Found ${structure.length} top-level folders`)

    // Print summary
    structure.forEach(folder => {
      console.log(`- ${folder.title} (${folder.slug}): ${folder.photos.length} photos`)
      if (folder.subfolders) {
        folder.subfolders.forEach(subfolder => {
          console.log(`  - ${subfolder.title} (${subfolder.slug}): ${subfolder.photos.length} photos`)
        })
      }
    })
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main().catch(console.error)
