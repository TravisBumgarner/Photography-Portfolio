import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    PUSHOVER_EMAIL: z.string(),
    PUSHOVER_PASSWORD: z.string(),
    PUSHOVER_DEVICE_NAME: z.string(),
})

const getEnv = () => {
    return envSchema.parse(process.env);
}

export default getEnv;