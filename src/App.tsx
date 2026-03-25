import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { StyleSheet } from 'react-native';
import { AppProvider } from '@context/AppContext';
import { storageService } from '@services/storageService';
import { RootNavigator } from '@navigation/RootNavigator';
import { ErrorBoundary } from '@components/ErrorBoundary';

function AppContent() {
  useEffect(() => {
    // Initialize storage on app start
    storageService.initialize();
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#0F0F1A" />
      <RootNavigator />
      <Toast />
    </>
  );
}

export function MainApp() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
