import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { auth } from '../firebase/config';
import FloatingNavbar from '../components/FloatingNavbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/ScreenWrapper';

const { width, height } = Dimensions.get('window');

// Constants for layout calculations
const NAVBAR_HEIGHT = 70; // Approximate height of the FloatingNavbar
const BOTTOM_PADDING = 20; // Extra padding for comfort

type RootStackParamList = {
  Home: undefined;
  AuthScreen: undefined;
  Dashboard: undefined;
  Features: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Caption typing animation
const captions = [
  "Exploring new horizons, one pixel at a time ✨ #digitaljourney",
  "When the algorithm meets creativity, magic happens 🚀 #AImagic",
  "Crafting words that capture moments, powered by AI 📱 #captionator"
];

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const isAuthenticated = !!auth?.currentUser;
  const [mainLikes, setMainLikes] = useState(1247);
  const [isLiked, setIsLiked] = useState(false);
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0);
  const [displayedCaption, setDisplayedCaption] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  // Get safe area insets for proper padding on different devices
  const insets = useSafeAreaInsets();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const gradientPosition = useRef(new Animated.Value(0)).current;
  
  // Refs for animations
  const lottieRef = useRef<LottieView>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Caption typing animation effect
  useEffect(() => {
    if (isTyping) {
      const currentFullCaption = captions[currentCaptionIndex];
      const nextCharIndex = displayedCaption.length;
      
      if (nextCharIndex < currentFullCaption.length) {
        // Still typing the current caption
        typingTimeout.current = setTimeout(() => {
          setDisplayedCaption(currentFullCaption.substring(0, nextCharIndex + 1));
        }, 50); // Adjust speed of typing
      } else {
        // Finished typing current caption, pause before moving to next
        typingTimeout.current = setTimeout(() => {
          setIsTyping(false);
          // After pause, start erasing
          typingTimeout.current = setTimeout(() => {
            setIsTyping(true);
            setDisplayedCaption('');
            setCurrentCaptionIndex((currentCaptionIndex + 1) % captions.length);
          }, 2000); // Pause between captions
        }, 1000);
      }
    }
    
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [displayedCaption, currentCaptionIndex, isTyping]);
  
  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    
    // Continuous rotation animation for the 3D effect
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    
    // Animate gradient
    Animated.loop(
      Animated.timing(gradientPosition, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      })
    ).start();
    
    // Play Lottie animation
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigation.navigate('Dashboard');
    } else {
      navigation.navigate('AuthScreen');
    }
  };

  const handleExploreFeatures = () => {
    navigation.navigate('Features');
  };
  
  const handleLike = () => {
    if (isLiked) {
      setMainLikes(prev => prev - 1);
    } else {
      setMainLikes(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };
  
  // Calculate rotation for 3D effect
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Calculate bottom padding to ensure content is visible above the navbar
  const bottomPadding = NAVBAR_HEIGHT + insets.bottom + BOTTOM_PADDING;

  return (
    <ScreenWrapper>
      {/* Animated Background Shapes */}
      <View style={styles.backgroundContainer}>
        {/* Animated shapes in background */}
        <Animated.View 
          style={[
            styles.floatingShape, 
            styles.shape1, 
            { 
              transform: [
                { rotate: spin },
                { translateX: translateY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 30],
                })},
              ],
            }
          ]}
        />
        <Animated.View 
          style={[
            styles.floatingShape, 
            styles.shape2, 
            { 
              transform: [
                { rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-360deg'],
                })},
              ],
            }
          ]}
        />
        <Animated.View 
          style={[
            styles.floatingShape, 
            styles.shape3, 
            { 
              transform: [
                { rotate: spin },
                { scale: scaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                })},
              ],
            }
          ]}
        />
        
        {/* Subtle gradient overlay */}
        <LinearGradient
          colors={['rgba(67, 56, 202, 0.1)', 'rgba(99, 102, 241, 0.1)', 'rgba(129, 140, 248, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
        />
      </View>
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.header, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: translateY }]
            }
          ]}
        >
          <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/images/captionator-logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.headerTitle}>Captionator</Text>
            </View>
          </BlurView>
        </Animated.View>
        
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: translateY },
              ]
            }
          ]}
        >
          <BlurView intensity={60} tint="dark" style={styles.heroBlurContainer}>
            <View style={styles.heroContent}>
              <View style={styles.heroTextContainer}>
                <Text style={styles.tagline}>AI-Powered Magic</Text>
                <Text style={styles.title}>Captions That Captivate</Text>
                <Text style={styles.subtitle}>
                  Transform your social media presence with AI-generated captions that perfectly match your content and style.
                </Text>
              </View>
              
              {/* Lottie animation */}
              <View style={styles.lottieContainer}>
                <LottieView
                  ref={lottieRef}
                  source={require('../assets/animations/social-media.json')}
                  style={styles.lottieAnimation}
                  autoPlay
                  loop
                />
              </View>
              
              {/* CTA Buttons */}
              <View style={styles.ctaContainer}>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleGetStarted}
                >
                  <Ionicons name="rocket-outline" size={20} color="#4338ca" style={styles.buttonIcon} />
                  <Text style={styles.primaryButtonText}>
                    {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={handleExploreFeatures}
                >
                  <Ionicons name="apps-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.secondaryButtonText}>
                    Explore Features
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Animated.View>
        
        {/* Instagram-like Preview Card */}
        <Animated.View 
          style={[
            styles.previewSection,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: translateY },
              ]
            }
          ]}
        >
          <View style={styles.instagramCard}>
            {/* Instagram Card Header */}
            <View style={styles.instagramCardHeader}>
              <View style={styles.instagramUserInfo}>
                <View style={styles.instagramProfilePicContainer}>
                  <Image 
                    source={require('../assets/images/captionator-logo.png')} 
                    style={styles.instagramProfilePic}
                  />
                </View>
                <Text style={styles.instagramUsername}>captionator_ai</Text>
              </View>
              <Ionicons name="ellipsis-horizontal" size={20} color="#333" />
            </View>
            
            {/* Instagram Card Image */}
            <Image 
              source={require('../assets/images/login-page-image.jpg')} 
              style={styles.instagramImage}
              resizeMode="cover"
            />
            
            {/* Instagram Card Actions */}
            <View style={styles.instagramActions}>
              <View style={styles.instagramLeftActions}>
                <TouchableOpacity onPress={handleLike} style={styles.instagramAction}>
                  <Ionicons 
                    name={isLiked ? "heart" : "heart-outline"} 
                    size={26} 
                    color={isLiked ? "#f43f5e" : "#333"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.instagramAction}>
                  <Ionicons name="chatbubble-outline" size={24} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.instagramAction}>
                  <Ionicons name="paper-plane-outline" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity>
                <Ionicons name="bookmark-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {/* Instagram Card Likes */}
            <Text style={styles.instagramLikes}>{mainLikes.toLocaleString()} likes</Text>
            
            {/* Instagram Card Caption with typing animation */}
            <View style={styles.instagramCaptionContainer}>
              <Text style={styles.instagramCaptionUsername}>captionator_ai</Text>
              <Text style={styles.instagramCaption}>
                {displayedCaption}
                <Text style={[styles.instagramCaption, isTyping ? styles.cursorBlink : {}]}>|</Text>
              </Text>
            </View>
            
            {/* Instagram Card Comments */}
            <TouchableOpacity>
              <Text style={styles.instagramViewComments}>View all 42 comments</Text>
            </TouchableOpacity>
            
            {/* Instagram Card Timestamp */}
            <Text style={styles.instagramTimestamp}>2 HOURS AGO</Text>
          </View>
        </Animated.View>
        
        {/* Features Section */}
        <Animated.View 
          style={[
            styles.featuresSection,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: Animated.multiply(translateY, 1.5) },
              ]
            }
          ]}
        >
          <Text style={styles.featuresSectionTitle}>Why Captionator?</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <LinearGradient
                  colors={['#4f46e5', '#818cf8']}
                  style={styles.featureIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="flash" size={24} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>AI-Powered</Text>
                <Text style={styles.featureDescription}>
                  Advanced AI models analyze your images to create perfect captions
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <LinearGradient
                  colors={['#4f46e5', '#818cf8']}
                  style={styles.featureIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="color-palette" size={24} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Customizable</Text>
                <Text style={styles.featureDescription}>
                  Adjust tone, style, and length to match your unique voice
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <LinearGradient
                  colors={['#4f46e5', '#818cf8']}
                  style={styles.featureIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="trending-up" size={24} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Engagement Boost</Text>
                <Text style={styles.featureDescription}>
                  Increase likes and comments with viral-worthy captions
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
        
        {/* Final CTA - Only show for non-authenticated users */}
        {!isAuthenticated && (
          <Animated.View 
            style={[
              styles.finalCTA,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: Animated.multiply(translateY, 2) },
                ]
              }
            ]}
          >
            <BlurView intensity={60} tint="dark" style={styles.finalCTABlur}>
              <Text style={styles.finalCTATitle}>Ready to Transform Your Social Media?</Text>
              <TouchableOpacity 
                style={styles.finalCTAButton}
                onPress={handleGetStarted}
              >
                <Ionicons name="flash-outline" size={20} color="#4338ca" style={styles.buttonIcon} />
                <Text style={styles.finalCTAButtonText}>Get Started Now</Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        )}
      </ScrollView>
      
      {/* Add the FloatingNavbar */}
      <FloatingNavbar />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingBottom: 40, // This will be overridden by the dynamic padding
  },
  backgroundContainer: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 0,
  },
  floatingShape: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.15,
  },
  shape1: {
    width: 250,
    height: 250,
    backgroundColor: '#e0e7ff',
    top: 50,
    right: -80,
  },
  shape2: {
    width: 200,
    height: 200,
    backgroundColor: '#c7d2fe',
    top: height * 0.4,
    left: -60,
  },
  shape3: {
    width: 300,
    height: 300,
    backgroundColor: '#a5b4fc',
    top: height * 0.65,
    right: -100,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginBottom: 20,
    position: 'relative',
    zIndex: 10,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  heroSection: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 30,
    overflow: 'hidden',
  },
  heroBlurContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroContent: {
    padding: 25,
  },
  heroTextContainer: {
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a5b4fc',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    lineHeight: 24,
    marginBottom: 16,
  },
  lottieContainer: {
    alignItems: 'center',
    marginVertical: 10,
    height: 160,
  },
  lottieAnimation: {
    width: 160,
    height: 160,
  },
  ctaContainer: {
    marginTop: 10,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#4338ca',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
  // Instagram Card Styles
  previewSection: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  instagramCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#efefef',
  },
  instagramCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#efefef',
  },
  instagramUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instagramProfilePicContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    padding: 2,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instagramProfilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  instagramUsername: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  instagramImage: {
    width: '100%',
    height: width - 40, // Square image
    backgroundColor: '#f5f5f5',
  },
  instagramActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  instagramLeftActions: {
    flexDirection: 'row',
    gap: 18,
  },
  instagramAction: {
    marginRight: 8,
  },
  instagramLikes: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  instagramCaptionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  instagramCaptionUsername: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 6,
  },
  instagramCaption: {
    color: '#333',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  cursorBlink: {
    opacity: 1,
    color: '#4338ca',
  },
  instagramViewComments: {
    color: '#8c8c8c',
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    opacity: 0.8,
  },
  instagramTimestamp: {
    color: '#8c8c8c',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  featuresSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  featuresSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  featuresList: {
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIconContainer: {
    marginRight: 15,
  },
  featureIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#e0e7ff',
    lineHeight: 20,
  },
  finalCTA: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 30,
    overflow: 'hidden',
  },
  finalCTABlur: {
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
  },
  finalCTATitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  finalCTAButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  finalCTAButtonText: {
    color: '#4338ca',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 