import crashlytics from "@react-native-firebase/crashlytics";

type LogLevel = "error" | "warn" | "info" | "debug";

interface LogEntry {
  level: LogLevel;
  context: string;
  message: string;
  timestamp: string;
  error?: unknown;
}

class Logger {
  private isDev = __DEV__;
  private logs: LogEntry[] = [];

  private log(level: LogLevel, context: string, message: string, error?: unknown) {
    const entry: LogEntry = {
      level,
      context,
      message,
      timestamp: new Date().toISOString(),
      error,
    };

    if (this.isDev) {
      switch (level) {
        case "error":
          console.error(`[${context}]`, message, error ?? "");
          break;
        case "warn":
          console.warn(`[${context}]`, message);
          break;
        case "info":
          console.info(`[${context}]`, message);
          break;
        case "debug":
          console.debug(`[${context}]`, message);
          break;
      }
    } else {
      if (level === "error") {
        let errorToRecord = error;
        if (!(error instanceof Error)) {
          errorToRecord = new Error(typeof error === "string" ? error : JSON.stringify(error) || message);
        }
        crashlytics().recordError(errorToRecord as Error);
        crashlytics().log(`[${context}] ERROR: ${message}`);
      } else {
        crashlytics().log(`[${context}] ${level.toUpperCase()}: ${message}`);
      }
    }

    this.logs.push(entry);

    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  setUserId(userId: string) {
    if (!this.isDev) {
      crashlytics().setUserId(userId);
    }
  }

  error(context: string, error: unknown) {
    this.log("error", context, "Erro encontrado", error);
  }

  warn(context: string, message: string) {
    this.log("warn", context, message);
  }

  info(context: string, message: string) {
    this.log("info", context, message);
  }

  debug(context: string, message: string) {
    this.log("debug", context, message);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
