import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    bucketName: z.string(),
    projectId: z.string(),
})

const getEnv = () => {
    return envSchema.parse({
        bucketName: process.env.BUCKET_NAME,
        projectId: process.env.PROJECT_ID,
    });
}

export default getEnv;