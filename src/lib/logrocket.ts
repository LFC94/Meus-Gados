import LogRocket from "@logrocket/react-native";

const LOGROCKET_APP_ID = process.env.EXPO_PUBLIC_LOGROCKET_APP_ID;

let isInitialized = false;

export function initLogRocket() {
  if (isInitialized || !LOGROCKET_APP_ID) {
    if (!LOGROCKET_APP_ID) {
      console.warn("LogRocket App ID not configured. Session recording disabled.");
    }
    return;
  }

  try {
    LogRocket.init(LOGROCKET_APP_ID);
    isInitialized = true;
    console.log("LogRocket initialized successfully");
  } catch (error) {
    console.error("Failed to initialize LogRocket:", error);
  }
}

export function identifyUser(userId: string, userInfo?: Record<string, any>) {
  if (!isInitialized) return;

  try {
    LogRocket.identify(userId, userInfo);
  } catch (error) {
    console.error("Failed to identify user in LogRocket:", error);
  }
}

export default LogRocket;
