import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.richard.fooddiary',
  appName: 'food-diary',
  webDir: 'build/browser',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
};

export default config;
