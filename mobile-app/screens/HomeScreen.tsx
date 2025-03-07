import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { APP_NAME } from '@env';
import { useAuth } from '../hooks/useAuth';
import AnimatedCaption from '../components/AnimatedCaption';
import FooterNavbar from '../components/FooterNavbar';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [mainLikes, setMainLikes] = useState(1024);
  const [isLiked, setIsLiked] = useState(false);

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

  const navigateToFeatures = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Features' as never,
      })
    );
  };

  const handleLike = () => {
    if (isLiked) {
      setMainLikes(prev => prev - 1);
    } else {
      setMainLikes(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4338ca" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/captionator-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Captionator</Text>
          </View>
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
            </View>
          </View>
        </View>

        {/* Instagram Card Demo */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>See How It Works</Text>
          
          <View style={styles.instagramCard}>
            {/* Instagram Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.profilePic}>
                  <Image 
                    source={require('../assets/images/captionator-logo.png')} 
                    style={styles.profilePicImage}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.username}>captionator_ai</Text>
              </View>
              <View style={styles.cardHeaderRight}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#1f2937" />
              </View>
            </View>
            
            {/* Instagram Card Image */}
            <View style={styles.cardImageContainer}>
              <Image 
                source={require('../assets/images/login-page-image.jpg')} 
                style={styles.demoImage} 
                resizeMode="cover"
              />
            </View>
            
            {/* Instagram Card Actions */}
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={handleLike} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={28} 
                  color={isLiked ? "#ef4444" : "#1f2937"} 
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="chatbubble-outline" size={26} color="#1f2937" style={styles.actionIcon} />
              </TouchableOpacity>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="paper-plane-outline" size={26} color="#1f2937" style={styles.actionIcon} />
              </TouchableOpacity>
              <View style={styles.spacer} />
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="bookmark-outline" size={26} color="#1f2937" style={styles.actionIcon} />
              </TouchableOpacity>
            </View>
            
            {/* Instagram Card Likes */}
            <View style={styles.likesContainer}>
              <Text style={styles.likesText}>{mainLikes.toLocaleString()} likes</Text>
            </View>
            
            {/* Instagram Card Caption */}
            <View style={styles.cardCaption}>
              <Text style={styles.captionUsername}>captionator_ai</Text>
              <View style={styles.captionTextContainer}>
                <AnimatedCaption 
                  captions={[
                    "Exploring new horizons, one step at a time. #adventure #journey",
                    "Finding beauty in the everyday moments. #gratitude #mindfulness",
                    "Living life in full color. #vibrant #authentic",
                    "Making memories that last a lifetime. #memories #experiences"
                  ]}
                  typingSpeed={50}
                  pauseDuration={2000}
                  deletingSpeed={30}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Transform Your Social Media?</Text>
          <View style={styles.ctaButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={navigateToAuth}
            >
              <Text style={styles.primaryButtonText}>Get Started Free</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={navigateToFeatures}
            >
              <Text style={styles.secondaryButtonText}>Explore Features</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <FooterNavbar />
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
    paddingBottom: 70, // Add padding for the footer navbar
  },
  header: {
    backgroundColor: '#4338ca',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: 'white',
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
  demoSection: {
    padding: 20,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  instagramCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  profilePicImage: {
    width: '100%',
    height: '100%',
  },
  username: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: 15,
  },
  cardHeaderRight: {},
  cardImageContainer: {
    width: '100%',
    height: width * 0.8,
    maxHeight: 400,
    backgroundColor: '#f3f4f6',
  },
  demoImage: {
    width: '100%',
    height: '100%',
  },
  cardActions: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 16,
  },
  spacer: {
    flex: 1,
  },
  likesContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  likesText: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: 15,
  },
  cardCaption: {
    padding: 12,
    paddingTop: 0,
  },
  captionUsername: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    fontSize: 15,
  },
  captionTextContainer: {
    minHeight: 60,
    justifyContent: 'center',
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
  ctaButtons: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#4338ca',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default HomeScreen; 