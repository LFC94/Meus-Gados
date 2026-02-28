jest.mock("@react-native-async-storage/async-storage", () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("@react-native-firebase/crashlytics", () => {
  return () => ({
    log: jest.fn(),
    recordError: jest.fn(),
    setUserId: jest.fn(),
  });
});
