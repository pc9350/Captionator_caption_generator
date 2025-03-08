import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: any;
  statusBarColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
}

/**
 * A wrapper component that provides consistent padding and safe area handling
 * for all screens across different device types.
 */
const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  statusBarColor = '#000',
  statusBarStyle = 'light-content',
}) => {
  const insets = useSafeAreaInsets();
  
  // Apply top padding on Android to match iOS safe area
  const topPadding = Platform.OS === 'android' ? insets.top : 0;
  
  return (
    <SafeAreaView style={[styles.container, { paddingTop: topPadding }, style]}>
      <StatusBar 
        barStyle={statusBarStyle} 
        backgroundColor={statusBarColor}
      />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default ScreenWrapper; 