import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  SafeAreaView, 
  Platform,
  StatusBar,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { APP_NAME } from '@env';
import { useAuth } from '../hooks/useAuth';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Redirect to Dashboard if user is already authenticated
  useEffect(() => {
    if (user) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Dashboard' as never }],
        })
      );
    }
  }, [user, navigation]);

  const navigateToAuth = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Auth' as never,
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4338ca" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Captionator</Text>
        </View>
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.tagline}>AI-Powered Caption Generator</Text>
              <Text style={styles.title}>Perfect Captions for Images & Videos</Text>
              <Text style={styles.subtitle}>
                Transform your social media presence with AI-generated captions that perfectly match your photos, videos, and content style.
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={navigateToAuth}
                >
                  <Text style={styles.primaryButtonText}>Get Started Free</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIconText}>AI</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>AI-Powered Captions</Text>
              <Text style={styles.featureDescription}>
                Generate engaging captions based on your images using advanced AI technology.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIconText}>🎭</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Multiple Tone Options</Text>
              <Text style={styles.featureDescription}>
                Choose from casual, professional, funny, inspirational, or storytelling tones.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIconText}>💾</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Save Favorite Captions</Text>
              <Text style={styles.featureDescription}>
                Save your favorite captions for later use and easy access.
              </Text>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Transform Your Social Media?</Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={navigateToAuth}
          >
            <Text style={styles.ctaButtonText}>Get Started Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#4338ca',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  heroSection: {
    backgroundColor: '#4338ca',
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  heroContent: {
    padding: 20,
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 14,
    color: '#a5b4fc',
    fontWeight: '600',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#c7d2fe',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '80%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#4338ca',
    fontWeight: '600',
    fontSize: 16,
  },
  featuresSection: {
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIconText: {
    fontSize: 24,
    color: '#4338ca',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  ctaSection: {
    backgroundColor: '#4338ca',
    padding: 30,
    borderRadius: 16,
    margin: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#4338ca',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default HomeScreen; 