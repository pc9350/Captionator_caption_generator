import React from 'react';
import ScreenWrapper from '../components/ScreenWrapper';

/**
 * Higher-order component that wraps a screen component with the ScreenWrapper
 * to provide consistent padding and safe area handling across all screens.
 * 
 * @param WrappedComponent The screen component to wrap
 * @param statusBarColor Optional status bar color (defaults to black)
 * @param statusBarStyle Optional status bar style (defaults to light-content)
 * @returns A wrapped component with proper screen padding
 */
const withScreenWrapper = (
  WrappedComponent: React.ComponentType<any>,
  statusBarColor = '#000',
  statusBarStyle: 'light-content' | 'dark-content' = 'light-content'
) => {
  // Return a new component
  return (props: any) => {
    return (
      <ScreenWrapper 
        statusBarColor={statusBarColor}
        statusBarStyle={statusBarStyle}
      >
        <WrappedComponent {...props} />
      </ScreenWrapper>
    );
  };
};

export default withScreenWrapper; 