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
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

type AuthMode = 'login' | 'signup' | 'reset';

const { width } = Dimensions.get('window');

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigation = useNavigation();
  const { login, signup, resetPassword, user } = useAuth();

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

  const handlePrivacyPolicy = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'PrivacyPolicy' as never
      })
    );
  };

  const handleTermsOfService = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'TermsOfService' as never
      })
    );
  };

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    // Clear fields when switching modes
    setPassword('');
    setConfirmPassword('');
    if (newMode === 'login' || newMode === 'reset') {
      setDisplayName('');
    }
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <Header title={mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Reset Password'} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/captionator-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Captionator</Text>
          </View>
          
          <Text style={styles.welcomeText}>
            {mode === 'login' ? 'Welcome Back!' : mode === 'signup' ? 'Create Your Account' : 'Reset Password'}
          </Text>
          <Text style={styles.subtitleText}>
            {mode === 'login'
              ? 'Sign in to continue generating amazing captions'
              : mode === 'signup'
              ? 'Join thousands of creators using AI-powered captions'
              : 'Enter your email to reset your password'}
          </Text>
          
          <View style={styles.formContainer}>
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
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#6b7280" 
                  />
                </TouchableOpacity>
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
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#6b7280" 
                  />
                </TouchableOpacity>
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
            
            {/* Legal Links */}
            <View style={styles.legalLinksContainer}>
              <Text style={styles.legalText}>
                By using this app, you agree to our{' '}
              </Text>
              <TouchableOpacity onPress={handleTermsOfService}>
                <Text style={styles.legalLink}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.legalText}> and </Text>
              <TouchableOpacity onPress={handlePrivacyPolicy}>
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </TouchableOpacity>
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
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4338ca',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
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
  eyeIcon: {
    padding: 8,
  },
  legalLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 10,
  },
  legalText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
  legalLink: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AuthScreen; 