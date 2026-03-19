type LogLevel = 'info' | 'warn' | 'error' | 'debug'
import { env } from '../../config/env.js'

interface LogEntry{
    logLevel: LogLevel;
    message: string;
    timestamp: string;
    service:string;
    [key:string]: unknown;
}


/**
 * Lightweight structured logger.
 *
 * In production → emits JSON (machine-readable, aggregated by Logtail/Datadog).
 * In development → emits readable colored output.
 *
 * Usage:
 *   logger.info("User registered", { userId: "abc123" })
 *   logger.error("DB connection failed", { error: err.message })
 */



const SERVICE_NAME = 'auth_service';

function formatEntry(level: LogLevel,message: string,meta?: Record<string, unknown>):LogEntry{
    return {
        logLevel:level,
        message:message,
        timestamp: new Date().toString(),
        service:SERVICE_NAME,
        ...meta,
    };
}

const LEVEL_COLORS:Record<LogLevel,string>={
    info: "\x1b[36m",   // Cyan
    warn: "\x1b[33m",   // Yellow
    error: "\x1b[31m",  // Red
    debug: "\x1b[90m",  // Gray
}

const RESET = '\x1b[0m';


function emit(level: LogLevel, message: string, meta?: Record<string, unknown>){

    const entry = formatEntry(level,message,meta)
    if(env.NODE_ENV == 'production'){
        // JSON log for log aggregators
        process.stdout.write(JSON.stringify(entry) + "\n")
    }else{
        const color = LEVEL_COLORS[level]
        const  prefix = `${color}[${level.toUpperCase()}]${RESET}`;
        const ts = `\x1b[90m${entry.timestamp}${RESET}`;
         const metaStr =
            meta && Object.keys(meta).length > 0
                ? ` ${JSON.stringify(meta)}`
                : "";
        process.stdout.write(`${ts} ${prefix} ${message}${metaStr}\n`);
    }
}


export const logger = {
     info: (message: string, meta?: Record<string, unknown>) =>
        emit("info", message, meta),
    warn: (message: string, meta?: Record<string, unknown>) =>
        emit("warn", message, meta),
    error: (message: string, meta?: Record<string, unknown>) =>
        emit("error", message, meta),
      debug: (message: string, meta?: Record<string, unknown>) => {
    if (env.NODE_ENV !== "production") emit("debug", message, meta);
},
}