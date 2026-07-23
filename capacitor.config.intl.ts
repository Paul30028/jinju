import type { CapacitorConfig } from "@capacitor/cli";

/** 国际区 Serein */
const config: CapacitorConfig = {
  appId: "app.serein.day",
  appName: "Serein",
  webDir: "dist",
  server: { androidScheme: "https" },
  android: {
    allowMixedContent: false,
    backgroundColor: "#f4f7f8",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#f4f7f8",
      showSpinner: false,
    },
  },
};

export default config;
