import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

type AuthMode = 'login' | 'signup' | 'reset';

const { width } = Dimensions.get('window');

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigation = useNavigation();
  const { login, signup, resetPassword, error, user } = useAuth();

  // Redirect to Dashboard if user is already authenticated
  useEffect(() => {
    if (user) {
      // Use CommonActions to reset the navigation state
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Dashboard' as never }],
        })
      );
    }
  }, [user, navigation]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // Validate inputs
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    
    if ((mode === 'login' || mode === 'signup') && !password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }
      
      if (!displayName.trim()) {
        Alert.alert('Error', 'Please enter your name');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting auth form:', mode);
      
      if (mode === 'login') {
        console.log(`Attempting to login with email: ${email}`);
        
        // Create a timeout to show a message if login is taking too long
        const loginTimeout = setTimeout(() => {
          Alert.alert(
            'Login Taking Too Long',
            'The login process is taking longer than expected. You can continue waiting or try again later.',
            [
              { text: 'Continue Waiting' },
              { 
                text: 'Cancel', 
                onPress: () => {
                  setIsSubmitting(false);
                }
              }
            ]
          );
        }, 5000);
        
        try {
          await login(email, password);
          clearTimeout(loginTimeout);
          // Navigation will be handled by the useEffect
        } catch (error) {
          clearTimeout(loginTimeout);
          throw error;
        }
      } else if (mode === 'signup') {
        await signup(email, password, displayName);
        // Navigation will be handled by the useEffect
      } else if (mode === 'reset') {
        await resetPassword(email);
        Alert.alert(
          'Password Reset',
          'If an account exists with this email, you will receive a password reset link.',
          [{ text: 'OK', onPress: () => setMode('login') }]
        );
      }
    } catch (err: any) {
      console.error('Auth error:', err.message);
      Alert.alert('Error', err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    // Clear fields when switching modes
    setPassword('');
    setConfirmPassword('');
    if (newMode === 'login' || newMode === 'reset') {
      setDisplayName('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo and App Name */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Captionator</Text>
            <Text style={styles.logoSubtext}>AI-Powered Caption Generator</Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
              </Text>
              <Text style={styles.subtitle}>
                {mode === 'login'
                  ? 'Sign in to continue using Captionator'
                  : mode === 'signup'
                  ? 'Create a new account to get started'
                  : 'Enter your email to reset your password'}
              </Text>
            </View>

            <View style={styles.form}>
              {mode === 'signup' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your.email@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {mode !== 'reset' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              )}

              {mode === 'signup' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
              )}

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.switchModeContainer}>
                {mode === 'login' && (
                  <>
                    <Text style={styles.switchModeText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => toggleMode('signup')}>
                      <Text style={styles.switchModeLink}>Sign Up</Text>
                    </TouchableOpacity>
                  </>
                )}

                {mode === 'signup' && (
                  <>
                    <Text style={styles.switchModeText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => toggleMode('login')}>
                      <Text style={styles.switchModeLink}>Sign In</Text>
                    </TouchableOpacity>
                  </>
                )}

                {mode === 'reset' && (
                  <TouchableOpacity onPress={() => toggleMode('login')}>
                    <Text style={styles.switchModeLink}>Back to Sign In</Text>
                  </TouchableOpacity>
                )}
              </View>

              {mode === 'login' && (
                <TouchableOpacity
                  style={styles.forgotPasswordButton}
                  onPress={() => toggleMode('reset')}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4338ca',
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#6b7280',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  switchModeText: {
    color: '#6b7280',
    fontSize: 14,
  },
  switchModeLink: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AuthScreen; 