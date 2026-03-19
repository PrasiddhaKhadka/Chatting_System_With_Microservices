import { z } from 'zod';
/**
 * Environment schema — validated once at startup.
 * If any required variable is missing, the process exits immediately
 * with a clear error. This prevents silent misconfiguration in production.
 */
const envSchema = z.object({
    NODE_ENV:z.enum(['development','production','test']).default('development'),
    port: z.coerce.number().int().positive().default(8000),
     // MongoDB
     MONGO_DB:  z.url("MONGO_URI must be a valid connection string"),
    // JWT — access token is short-lived, refresh token is long-lived
    JWT_SECRET_KEY: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
    JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    // Bcrypt — higher rounds = slower hashing (12 is production standard)
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
});


type Env = z.infer<typeof envSchema>

function loadEnv():Env{
    const result = envSchema.safeParse(process.env)

    if(!result.success){

        console.error("❌  Invalid environment configuration:");
        result.error.issues.forEach((issue) => {
            console.error(`   • ${issue.path.join(".")}: ${issue.message}`);
        });
        process.exit(1);
    }
    return result.data;
}

// Singleton — imported everywhere, validated once
export const env = loadEnv();
