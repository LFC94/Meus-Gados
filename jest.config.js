module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text", "lcov"],
  coverageThreshold: {
    "src/lib/helpers.ts": {
      branches: 70,
      functions: 80,
      lines: 85,
      statements: 85,
    },
    "src/lib/storage/base.ts": {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@react-native-async-storage/async-storage$":
      "<rootDir>/src/__tests__/__mocks__/async-storage.ts",
  },
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-native-community|expo|@expo|expo-modules-core)/)",
  ],
  testEnvironment: "jsdom",
};
