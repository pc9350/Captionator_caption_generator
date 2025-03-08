import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator, Button, Alert } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

// Screens
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import FeaturesScreen from './screens/FeaturesScreen';
import SavedCaptionsScreen from './screens/SavedCaptionsScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';

// Define the stack navigator types
type RootStackParamList = {
  Home: undefined;
  Auth: undefined;
  Dashboard: undefined;
  Features: undefined;
  SavedCaptions: undefined;
  Profile: undefined;
  EditProfile: undefined;
  HelpSupport: undefined;
  PrivacyPolicy: undefined;
  ChangePassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Create separate stacks for authenticated and unauthenticated users
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#f8f9fa' },
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Auth" component={AuthScreen} />
    <Stack.Screen name="Features" component={FeaturesScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#f8f9fa' },
    }}
  >
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="SavedCaptions" component={SavedCaptionsScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Features" component={FeaturesScreen} />
  </Stack.Navigator>
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Use a ref to track if the auth state listener is already set up
  const authListenerSetup = useRef(false);

  useEffect(() => {
    // Prevent setting up multiple listeners
    if (authListenerSetup.current) {
      return;
    }
    
    authListenerSetup.current = true;
    console.log('App.tsx: Setting up auth state listener');
    
    // Set a timeout to show a message if loading takes too long
    const timeout = setTimeout(() => {
      setLoadingTimeout(true);
    }, 10000);
    
    // Check if the user is authenticated
    if (!auth) {
      console.error('App.tsx: Firebase auth is not initialized');
      setIsLoading(false);
      setAuthError('Firebase auth is not initialized');
      clearTimeout(timeout);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        console.log('App.tsx: Auth state changed:', user ? `User: ${user.uid}` : 'No user');
        setIsAuthenticated(!!user);
        setIsLoading(false);
        clearTimeout(timeout);
      },
      (error) => {
        console.error('App.tsx: Auth state error:', error.message);
        setAuthError(error.message);
        setIsLoading(false);
        clearTimeout(timeout);
      }
    );

    return () => {
      console.log('App.tsx: Cleaning up auth state listener');
      authListenerSetup.current = false;
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []); // Empty dependency array to run only once

  // If loading is taking too long, show a message
  useEffect(() => {
    if (loadingTimeout && isLoading) {
      Alert.alert(
        'Loading Taking Too Long',
        'The app is taking longer than expected to load. This might be due to network issues.',
        [{ text: 'OK' }]
      );
    }
  }, [loadingTimeout, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
        {loadingTimeout && (
          <Text style={{ marginTop: 10, color: 'orange' }}>
            This is taking longer than expected. Please wait...
          </Text>
        )}
      </View>
    );
  }

  if (authError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', marginBottom: 20 }}>Error: {authError}</Text>
        <Button 
          title="Retry" 
          onPress={() => {
            authListenerSetup.current = false; // Reset the listener setup flag
            setAuthError(null);
            setIsLoading(true);
            setLoadingTimeout(false);
          }} 
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
} 