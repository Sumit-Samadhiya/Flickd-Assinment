import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Upload: undefined;
  Generation: { imageUri: string; styles?: string[] };
  Results: { jobId?: string };
  Settings: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type UploadScreenProps = NativeStackScreenProps<RootStackParamList, 'Upload'>;
export type GenerationScreenProps = NativeStackScreenProps<RootStackParamList, 'Generation'>;
export type ResultsScreenProps = NativeStackScreenProps<RootStackParamList, 'Results'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
