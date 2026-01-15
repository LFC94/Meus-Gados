// Load environment variables with proper priority (system > .env)
import type { ExpoConfig } from "expo/config";
import "./src/scripts/load-env.js";

const bundleId = "com.lfcapp.meus.gados.t20260102074808";
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `lfcapp${timestamp}`;

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const rand = String(Math.floor(Math.random() * 101)).padStart(3, "0");
const dynamicVersion = `1.0.${year}${month}${day}${rand}`;

const env = {
  // App branding - update these values directly (do not use env vars)
  appName: "Meus Gados",
  appSlug: "meus-gados",
  logoUrl: "./src/assets/images/icon.png",
  scheme: schemeFromBundleId,
  iosBundleId: bundleId,
  androidPackage: bundleId,
  version: dynamicVersion,
  minSdkVersion: 25, // Android 7.1 (Nougat)
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: env.version,
  orientation: "portrait",
  icon: "./src/assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
  },
  owner: "luc4scost4",
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./src/assets/images/android-icon-foreground.png",
      backgroundImage: "./src/assets/images/android-icon-background.png",
      monochromeImage: "./src/assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
    permissions: ["POST_NOTIFICATIONS"],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./src/assets/images/favicon.png",
  },
  plugins: [
    "@react-native-community/datetimepicker",
    "expo-font",
    "expo-router",
    "@logrocket/react-native",
    "@react-native-google-signin/google-signin",
    [
      "expo-splash-screen",
      {
        image: "./src/assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          minSdkVersion: env.minSdkVersion,
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
