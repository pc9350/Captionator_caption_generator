import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import Header from '../components/Header';
import FooterNavbar from '../components/FooterNavbar';
import AnimatedButton from '../components/AnimatedButton';
import FloatingNavbar from '../components/FloatingNavbar';
import { useAuth } from '../hooks/useAuth';

const { width } = Dimensions.get('window');

// Feature data with animation paths
const FEATURES = [
  {
    id: 'ai-powered',
    title: 'AI-Powered Caption Generation',
    description: 'Leverages OpenAI to create contextually relevant captions based on your images and videos.',
    animation: require('../assets/animations/ai-animation.json'),
  },
  {
    id: 'video-support',
    title: 'Video Support',
    description: 'Generate captions for both images and videos with equal precision and creativity.',
    animation: require('../assets/animations/video-animation.json'),
  },
  {
    id: 'caption-length',
    title: 'Multiple Caption Lengths',
    description: 'Choose from single-word, micro, short, medium, or long captions to fit your content needs.',
    animation: require('../assets/animations/length-animation.json'),
  },
  {
    id: 'tone-options',
    title: 'Multiple Tone Options',
    description: 'Select from casual, professional, funny, inspirational, or storytelling tones to match your style.',
    animation: require('../assets/animations/tone-animation.json'),
  },
  {
    id: 'hashtags',
    title: 'Hashtag Generation',
    description: 'Automatically generate relevant hashtags to increase your content visibility.',
    animation: require('../assets/animations/hashtag-animation.json'),
  },
  {
    id: 'emoji',
    title: 'Emoji Suggestions',
    description: 'Get emoji suggestions that match the mood and content of your media.',
    animation: require('../assets/animations/emoji-animation.json'),
  },
];

const FeaturesScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const navigateToAuth = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AuthScreen'
      })
    );
  };
  
  const handleBackNavigation = () => {
    // Navigate to Home screen explicitly instead of using goBack()
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Home'
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <Header 
        title="Features" 
        customBackAction={handleBackNavigation}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Powerful Features</Text>
        <Text style={styles.subheading}>
          Discover all the ways Captionator can help you create engaging content
        </Text>
        
        {/* Features List */}
        <View style={styles.featuresGrid}>
          {FEATURES.map((feature) => (
            <View key={feature.id} style={styles.featureCard}>
              <View style={styles.animationContainer}>
                <LottieView
                  source={feature.animation}
                  autoPlay
                  loop
                  style={styles.animation}
                />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
        
        {/* Call to Action - Only show for non-authenticated users */}
        {!isAuthenticated && (
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
            <Text style={styles.ctaSubtitle}>
              Create your free account and start generating amazing captions today.
            </Text>
            <AnimatedButton
              title="Sign Up Free"
              onPress={navigateToAuth}
              primary={true}
              icon="person-add-outline"
              size="medium"
            />
          </View>
        )}
      </ScrollView>
      
      <FloatingNavbar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 90, // Add padding for the footer navbar
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: width > 600 ? (width - 60) / 3 : (width - 40) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  animationContainer: {
    height: 100,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 80,
    height: 80,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  ctaSection: {
    backgroundColor: '#4338ca',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#c7d2fe',
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default FeaturesScreen; 