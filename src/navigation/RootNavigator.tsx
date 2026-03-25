import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '@screens/HomeScreen';
import { UploadScreen } from '@screens/UploadScreen';
import { GenerationScreen } from '@screens/GenerationScreen';
import { ResultsScreen } from '@screens/ResultsScreen';
import { SettingsScreen } from '@screens/SettingsScreen';
import { colors, typography } from '@styles/tokens';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background.secondary,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: typography.fontWeight.bold,
            fontSize: typography.fontSize.lg,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background.primary,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Upload"
          component={UploadScreen}
          options={{ title: 'Choose Photo' }}
        />
        <Stack.Screen
          name="Generation"
          component={GenerationScreen}
          options={{ title: 'Generating', headerBackVisible: false }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ title: 'Your Cliparts' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
