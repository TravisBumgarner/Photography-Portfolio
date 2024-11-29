import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import getEnv from './setup';

const {bucketName, projectId} = getEnv();


const storage = new Storage({
    projectId,
});

async function uploadFile(filePath: string) {
  try {
    await storage.bucket(bucketName).upload(filePath, {
      metadata: {
        cacheControl: 'public, max-age=31536000', // 1 year
      },
      destination: path.basename(filePath),
    });
    console.log(`\t${filePath} uploaded to ${bucketName}.`);
  } catch (error) {
    console.error(`\tFailed to upload ${filePath}:`, error);
  }
}

// Function to upload all files in a directory
async function uploadDirectory(directoryPath: string) {
console.log(`Uploading directory: ${directoryPath}`);
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Unable to scan directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      uploadFile(filePath);
    });
  });
}

// Start the upload process
const rootPath = path.join(os.homedir(), "Desktop");
await uploadDirectory(path.join(rootPath, "large"));
await uploadDirectory(path.join(rootPath, "thumbnail"));