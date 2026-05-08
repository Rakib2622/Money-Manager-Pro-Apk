import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moneymanager.pro',
  appName: 'MoneyManager Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
