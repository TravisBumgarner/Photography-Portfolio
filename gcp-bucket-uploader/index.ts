import { Storage } from "@google-cloud/storage";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import getEnv from "./setup";

const { bucketName, projectId } = getEnv();

const storage = new Storage({
  projectId,
});

async function uploadFile({ filePath, bucketFolder, counter }: { filePath: string; bucketFolder: string; counter: number }) {
  const maxRetries = 3;
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const destinationPath = path.join(
        "photos",
        bucketFolder,
        path.basename(filePath)
      );
      await storage.bucket(bucketName).upload(filePath, {
        metadata: {
          cacheControl: "public, max-age=31536000", // 1 year
        },
        destination: destinationPath,
      });
      console.log(
        `\t${filePath} uploaded to ${bucketName} (${counter})`
      );
      break; // Exit the loop if upload is successful
    } catch (error) {
      console.error(`\tFailed to upload ${filePath} on attempt ${attempt}:`, error);
      if (attempt < maxRetries) {
        console.log(`\tRetrying in 3 seconds...`);
        await delay(3000); // Wait for 3 seconds before retrying
      } else {
        throw new Error(`\tAll attempts to upload ${filePath} failed.`)
      }
    }
  }
}

const rootPath = path.join(os.homedir(), "Desktop");

async function uploadDirectory(bucketFolder: string) {
  const directoryPath = path.join(rootPath, bucketFolder);
  console.log(`Uploading directory: ${directoryPath}`);
  let counter = 0;
  
  try {
    const files = await fs.promises.readdir(directoryPath);
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      await uploadFile({ filePath, bucketFolder, counter });
      counter++;
    }
  } catch (err) {
    console.error("Unable to scan directory:", err);
  }
}

await uploadDirectory("large");
// await uploadDirectory("thumbnail");