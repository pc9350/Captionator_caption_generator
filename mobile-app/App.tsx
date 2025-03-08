import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import withScreenWrapper from './utils/withScreenWrapper';

// Import screens
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import SavedCaptionsScreen from './screens/SavedCaptionsScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import FeaturesScreen from './screens/FeaturesScreen';

// Wrap screens with ScreenWrapper (except HomeScreen which already uses it directly)
const WrappedAuthScreen = withScreenWrapper(AuthScreen);
const WrappedDashboardScreen = withScreenWrapper(DashboardScreen);
const WrappedSavedCaptionsScreen = withScreenWrapper(SavedCaptionsScreen);
const WrappedProfileScreen = withScreenWrapper(ProfileScreen);
const WrappedEditProfileScreen = withScreenWrapper(EditProfileScreen);
const WrappedHelpSupportScreen = withScreenWrapper(HelpSupportScreen);
const WrappedPrivacyPolicyScreen = withScreenWrapper(PrivacyPolicyScreen);
const WrappedChangePasswordScreen = withScreenWrapper(ChangePasswordScreen);
const WrappedFeaturesScreen = withScreenWrapper(FeaturesScreen);

// Define types for our stack navigators
type AuthStackParamList = {
  Home: undefined;
  AuthScreen: undefined;
  Features: undefined;
};

type AppStackParamList = {
  Dashboard: undefined;
  SavedCaptions: undefined;
  Profile: undefined;
  EditProfile: undefined;
  HelpSupport: undefined;
  PrivacyPolicy: undefined;
  ChangePassword: undefined;
  Features: undefined;
  Home: undefined;
};

// Create the navigators
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// Auth Stack Navigator - for unauthenticated users
const AuthStackNavigator = () => (
  <AuthStack.Navigator 
    initialRouteName="Home"
    screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right'
    }}
  >
    <AuthStack.Screen name="Home" component={HomeScreen} />
    <AuthStack.Screen name="AuthScreen" component={WrappedAuthScreen} />
    <AuthStack.Screen name="Features" component={WrappedFeaturesScreen} />
  </AuthStack.Navigator>
);

// App Stack Navigator - for authenticated users
const AppStackNavigator = () => (
  <AppStack.Navigator 
    initialRouteName="Dashboard"
    screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right'
    }}
  >
    <AppStack.Screen name="Dashboard" component={WrappedDashboardScreen} />
    <AppStack.Screen name="SavedCaptions" component={WrappedSavedCaptionsScreen} />
    <AppStack.Screen name="Profile" component={WrappedProfileScreen} />
    <AppStack.Screen name="EditProfile" component={WrappedEditProfileScreen} />
    <AppStack.Screen name="HelpSupport" component={WrappedHelpSupportScreen} />
    <AppStack.Screen name="PrivacyPolicy" component={WrappedPrivacyPolicyScreen} />
    <AppStack.Screen name="ChangePassword" component={WrappedChangePasswordScreen} />
    <AppStack.Screen name="Features" component={WrappedFeaturesScreen} />
    <AppStack.Screen name="Home" component={HomeScreen} />
  </AppStack.Navigator>
);

// Main App component
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Auth listener setup tracking
  const authListenerSetup = useRef(false);
  
  // Set up Firebase auth listener
  useEffect(() => {
    if (!authListenerSetup.current && auth) {
      authListenerSetup.current = true;
      console.log('Setting up auth listener...');
      
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsLoading(false);
        if (user) {
          console.log('User is signed in:', user.uid);
          setIsAuthenticated(true);
          setUser(user);
        } else {
          console.log('User is signed out');
          setIsAuthenticated(false);
          setUser(null);
        }
      }, (error) => {
        console.error('Auth state change error:', error);
        setIsLoading(false);
      });
      
      return () => {
        unsubscribe();
        authListenerSetup.current = false;
      };
    } else {
      // If auth is not available, just set loading to false
      setIsLoading(false);
    }
  }, []);
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4338ca" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // The key part: NavigationContainer wraps only ONE navigator hierarchy,
  // but we conditionally render different navigators based on auth state
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <AppStackNavigator /> : <AuthStackNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
}); 