export const themeColors: {
  primary: { light: string; dark: string };
  background: { light: string; dark: string };
  surface: { light: string; dark: string };
  foreground: { light: string; dark: string };
  muted: { light: string; dark: string };
  border: { light: string; dark: string };
  success: { light: string; dark: string };
  warning: { light: string; dark: string };
  error: { light: string; dark: string };
  treatment: { light: string; dark: string };
  healthy: { light: string; dark: string };
  deceased: { light: string; dark: string };
  pregnant: { light: string; dark: string };
  pregnant_delayed: { light: string; dark: string };
  vaccine_pending: { light: string; dark: string };
  milk_production: { light: string; dark: string };
  scheduled_notification: { light: string; dark: string };
  morning: { light: string; dark: string };
  afternoon: { light: string; dark: string };
  full_day: { light: string; dark: string };
};

declare const themeConfig: {
  themeColors: typeof themeColors;
};

export default themeConfig;
