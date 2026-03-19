import mongoose from "mongoose";
import { logger } from "../utils/logger/logger.js";


/**
 * Connects to MongoDB with retry logic.
 *
 * WHY retry: In Docker Compose, the app container often starts before
 * MongoDB is ready. Without retries, the service crashes on startup.
 * Production Kubernetes setups use readiness probes for this — but
 * retries are a good extra layer.
 */

const RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 3000;

export const connectDb = async(MONGO_DB_URL:string):Promise<void> => {
    for(let attempts = 0 ; attempts<=RETRY_ATTEMPTS; attempts++){
    try {
            await mongoose.connect(MONGO_DB_URL,{
                maxPoolSize: 10,
                minPoolSize: 2,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            
            logger.info("MongoDB connected",{
                host: mongoose.connection.host,
                db: mongoose.connection.name,
            })

            return;
            
        }catch (error:any) {
            const isLastAttempt = attempts === RETRY_ATTEMPTS;
             
            logger.warn(`MongoDB connection attempt ${attempts}/${RETRY_ATTEMPTS} failed`, {
                error: error instanceof Error ? error.message : String(error),
            });
        
            if (isLastAttempt) {
                logger.error("MongoDB connection failed after all retries. Exiting.");
                process.exit(1);
            }
            
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
    }
    
}



/**
 * Graceful shutdown — closes MongoDB connection cleanly.
 * Called during SIGTERM/SIGINT handling in index.ts.
 */


/**
 * Graceful shutdown — closes MongoDB connection cleanly.
 * Called during SIGTERM/SIGINT handling in index.ts.
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
  logger.info("MongoDB connection closed");
}

// Log connection lifecycle events
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});


mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected");
});
 