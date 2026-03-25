import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ClipArt AI',
  slug: 'clipart-ai',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  splash: {
    backgroundColor: '#0F0F1A',
    resizeMode: 'contain',
  },
  assetBundlePatterns: ['**/*'],
  platforms: ['android'],
  android: {
    package: 'com.clipartai.app',
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: '#0F0F1A',
    },
    permissions: [
      'android.permission.CAMERA',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
    ],
  },
  // Non-secret runtime config - AI keys must remain server-side only
  extra: {
    backendUrl: process.env.BACKEND_URL ?? 'http://localhost:3000',
    appEnv: process.env.APP_ENV ?? 'development',
    apiTimeout: Number(process.env.API_TIMEOUT ?? 30000),
    maxImageSize: Number(process.env.MAX_IMAGE_SIZE ?? 10485760),
    supportedFormats: (process.env.SUPPORTED_FORMATS ?? 'jpg,jpeg,png').split(','),
  },
});
