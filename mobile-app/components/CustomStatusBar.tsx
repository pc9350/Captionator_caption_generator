import React from 'react';
import { View, StatusBar, StyleSheet, Platform } from 'react-native';

interface CustomStatusBarProps {
  backgroundColor?: string;
  barStyle?: 'light-content' | 'dark-content';
}

/**
 * A custom StatusBar component that handles platform differences correctly.
 * This component adds a View with the appropriate height and color to match the status bar.
 */
const CustomStatusBar: React.FC<CustomStatusBarProps> = ({
  backgroundColor = '#000',
  barStyle = 'light-content',
}) => {
  // Use a higher value for Android to ensure enough padding
  const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 40;

  return (
    <>
      <StatusBar backgroundColor={backgroundColor} barStyle={barStyle} />
      <View style={[styles.statusBar, { height: STATUSBAR_HEIGHT, backgroundColor }]} />
    </>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    width: '100%',
  },
});

export default CustomStatusBar; 