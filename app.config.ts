// Load environment variables with proper priority (system > .env)
import "./src/scripts/load-env.js";

import type { ExpoConfig } from "expo/config";

const bundleId = "com.lfcapp.meus.gados.t20260102074808";
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `lfcapp${timestamp}`;

const now = new Date();
const year = String(now.getFullYear()).padEnd(2, "0");
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const dynamicVersion = `1.${year}${month}.${day}`;

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
  platforms: ["android", "ios"],
  orientation: "portrait",
  icon: "./src/assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  updates: {
    url: "https://u.expo.dev/fe4dc638-7548-439f-b5f2-11bce15ac37f",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  extra: {
    eas: {
      projectId: "fe4dc638-7548-439f-b5f2-11bce15ac37f",
    },
  },
  owner: "luc4scost4",
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#a2d1a3",
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

  plugins: [
    "@react-native-community/datetimepicker",
    "expo-font",
    "expo-router",
    "expo-updates",
    "@react-native-google-signin/google-signin",
    [
      "expo-splash-screen",
      {
        image: "./src/assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#c0e2c1",
        dark: {
          backgroundColor: "#016805",
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
