import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp, ParamListBase, CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AnimatedCaption from '../components/AnimatedCaption';
import LottieView from 'lottie-react-native';
import AnimatedCaptionCard from '../components/AnimatedCaptionCard';
import AnimatedButton from '../components/AnimatedButton';
import FloatingNavbar from '../components/FloatingNavbar';
import { useAuth } from '../hooks/useAuth';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [mainLikes, setMainLikes] = useState(1247);
  const [isLiked, setIsLiked] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const gradientPosition = useRef(new Animated.Value(0)).current;
  
  // Refs for animations
  const lottieRef = useRef<LottieView>(null);
  
  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
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

  const navigateToAuth = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Auth'
        })
      );
    });
  };

  const navigateToFeatures = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Features'
        })
      );
    });
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
  
  // Interpolate gradient positions
  const gradientStart = gradientPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });
  
  const gradientEnd = gradientPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Background */}
        <Animated.View style={[styles.backgroundGradient, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['#4338ca', '#6366f1', '#818cf8', '#4338ca']}
            start={{ x: Number(gradientStart), y: 0 }}
            end={{ x: Number(gradientEnd), y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          
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
                zIndex: 1
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
                zIndex: 1
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
                zIndex: 1
              }
            ]}
          />
        </Animated.View>
        
        {/* Header with 3D effect */}
        <Animated.View 
          style={[
            styles.header, 
            { 
              opacity: fadeAnim,
              transform: [
                { translateY: translateY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                })},
              ],
              zIndex: 10
            }
          ]}
        >
          <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
            <View style={styles.logoContainer}>
              <Animated.View 
                style={{ 
                  transform: [
                    { scale: scaleAnim },
                  ] 
                }}
              >
                <Image 
                  source={require('../assets/images/captionator-logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </Animated.View>
              <Animated.Text 
                style={[
                  styles.headerTitle,
                ]}
              >
                Captionator
              </Animated.Text>
            </View>
          </BlurView>
        </Animated.View>
        
        {/* Hero Section with 3D parallax effect */}
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
          <BlurView intensity={30} tint="dark" style={styles.heroBlurContainer}>
            <View style={styles.heroContent}>
              <View style={styles.heroTextContainer}>
                <Animated.Text 
                  style={[
                    styles.tagline,
                    {
                      transform: [
                        { translateY: translateY.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 10],
                        })},
                      ]
                    }
                  ]}
                >
                  AI-Powered Magic
                </Animated.Text>
                <Animated.Text 
                  style={[
                    styles.title,
                    {
                      transform: [
                        { translateY: translateY.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 20],
                        })},
                      ]
                    }
                  ]}
                >
                  Captions That Captivate
                </Animated.Text>
                <Animated.Text 
                  style={[
                    styles.subtitle,
                    {
                      transform: [
                        { translateY: translateY.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 30],
                        })},
                      ]
                    }
                  ]}
                >
                  Transform your social media presence with AI-generated captions that perfectly match your content and style.
                </Animated.Text>
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
                <AnimatedButton
                  title="Get Started"
                  onPress={navigateToAuth}
                  primary={true}
                  icon="rocket-outline"
                  size="medium"
                  style={{ flex: 1, marginRight: 10 }}
                />
                
                <AnimatedButton
                  title="Explore Features"
                  onPress={navigateToFeatures}
                  primary={false}
                  icon="apps-outline"
                  size="medium"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </BlurView>
        </Animated.View>
        
        {/* Instagram-like Preview Card with 3D effect */}
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
          <AnimatedCaptionCard
            username="captionator_ai"
            profileImage={require('../assets/images/captionator-logo.png')}
            postImage={require('../assets/images/login-page-image.jpg')}
            captions={[
              "Exploring new horizons, one pixel at a time ✨ #digitaljourney",
              "When the algorithm meets creativity, magic happens 🚀 #AImagic",
              "Crafting words that capture moments, powered by AI 📱 #captionator"
            ]}
            likes={mainLikes}
            onLike={handleLike}
            isLiked={isLiked}
            onShare={() => {}}
            onSave={() => {}}
            keepAnimation={true}
          />
        </Animated.View>
        
        {/* Features Section */}
        <Animated.View 
          style={[
            styles.featuresSection,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: translateY },
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
                  { scale: scaleAnim },
                  { translateY: translateY },
                ]
              }
            ]}
          >
            <BlurView intensity={60} tint="dark" style={styles.finalCTABlur}>
              <Text style={styles.finalCTATitle}>Ready to Transform Your Social Media?</Text>
              <AnimatedButton
                title="Get Started Now"
                onPress={navigateToAuth}
                primary={true}
                icon="flash-outline"
                size="large"
                fullWidth={true}
              />
            </BlurView>
          </Animated.View>
        )}
      </ScrollView>
      
      {/* Add the new FloatingNavbar */}
      <FloatingNavbar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  backgroundGradient: {
    position: 'absolute',
    width: width,
    height: height * 1.5,
    zIndex: 0,
  },
  floatingShape: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.4,
  },
  shape1: {
    width: 200,
    height: 200,
    backgroundColor: '#a5b4fc',
    top: 100,
    right: -50,
  },
  shape2: {
    width: 150,
    height: 150,
    backgroundColor: '#818cf8',
    top: height * 0.4,
    left: -30,
  },
  shape3: {
    width: 180,
    height: 180,
    backgroundColor: '#6366f1',
    top: height * 0.7,
    right: 20,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    width: '100%',
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
    flexShrink: 1,
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
    marginBottom: 20,
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
  },
  lottieContainer: {
    alignItems: 'center',
    marginVertical: 20,
    height: 200,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  ctaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  previewSection: {
    marginHorizontal: 20,
    marginBottom: 30,
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
    borderRadius: 20,
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
});

export default HomeScreen; 