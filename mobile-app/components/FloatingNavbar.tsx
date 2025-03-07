import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, NavigationProp, ParamListBase, CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import CustomIcon from './CustomIcon';
import { useAuth } from '../hooks/useAuth';

const { width } = Dimensions.get('window');

interface NavItem {
  name: string;
  icon: string;
  activeIcon: string;
  route: string;
  authRequired?: boolean;
  unauthRoute?: string;
  authOnly?: boolean; // Only show for authenticated users
}

// Define navigation items
const getNavItems = (isAuthenticated: boolean): NavItem[] => {
  const baseItems: NavItem[] = [
    {
      name: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
      route: 'Home',
      authRequired: false,
    },
    {
      name: 'Generate',
      icon: 'add-circle-outline',
      activeIcon: 'add-circle',
      route: 'Dashboard',
      authRequired: true,
      unauthRoute: 'Auth',
    },
  ];
  
  // Add Saved Captions for authenticated users
  if (isAuthenticated) {
    baseItems.push({
      name: 'Saved',
      icon: 'bookmark-outline',
      activeIcon: 'bookmark',
      route: 'SavedCaptions',
      authRequired: true,
      authOnly: true,
    });
  }
  
  // Add Features and Profile for all users
  baseItems.push(
    {
      name: 'Features',
      icon: 'grid-outline',
      activeIcon: 'grid',
      route: 'Features',
      authRequired: false,
    },
    {
      name: 'Profile',
      icon: 'person-outline',
      activeIcon: 'person',
      route: 'Profile',
      authRequired: true,
      unauthRoute: 'Auth',
    }
  );
  
  return baseItems;
};

const FloatingNavbar = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute();
  const currentRouteName = route.name;
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  // Get navigation items based on authentication status
  const NAV_ITEMS = getNavItems(isAuthenticated);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const generateButtonAnim = useRef(new Animated.Value(0)).current;
  
  // Start animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Continuous pulse animation for generate button
    Animated.loop(
      Animated.sequence([
        Animated.timing(generateButtonAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(generateButtonAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const handleNavigation = (item: NavItem) => {
    // If the route requires authentication and user is not logged in,
    // navigate to the unauthRoute (usually Auth screen)
    if (item.authRequired && !user) {
      navigation.dispatch(
        CommonActions.navigate({
          name: item.unauthRoute || 'Auth'
        })
      );
      return;
    }
    
    // Otherwise navigate to the intended route
    navigation.dispatch(
      CommonActions.navigate({
        name: item.route
      })
    );
  };
  
  const generateButtonScale = generateButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });
  
  const generateButtonOpacity = generateButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(67, 56, 202, 0.7)', 'rgba(79, 70, 229, 0.7)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <View style={styles.navItemsContainer}>
            {NAV_ITEMS.map((item) => {
              const isActive = currentRouteName === item.route;
              const isGenerate = item.route === 'Dashboard';
              const isProfile = item.route === 'Profile';
              
              // Special styling for the generate button
              if (isGenerate) {
                return (
                  <Animated.View 
                    key={item.name}
                    style={[
                      styles.generateButtonContainer,
                      {
                        transform: [{ scale: generateButtonScale }],
                        opacity: generateButtonOpacity,
                      }
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.generateButton}
                      onPress={() => handleNavigation(item)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#6366f1', '#4338ca']}
                        style={styles.generateButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <CustomIcon 
                          name="add" 
                          size={28} 
                          color="#ffffff" 
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                    <Text style={styles.generateLabel}>Generate</Text>
                  </Animated.View>
                );
              }
              
              return (
                <TouchableOpacity
                  key={item.name}
                  style={styles.navItem}
                  onPress={() => handleNavigation(item)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.iconContainer,
                    isActive && styles.activeIconContainer
                  ]}>
                    <CustomIcon
                      name={isActive ? item.activeIcon : item.icon}
                      size={22}
                      color={isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'}
                      style={[
                        styles.icon,
                        isActive && styles.activeIcon
                      ]}
                    />
                    {isActive && (
                      <View style={styles.activeIndicator} />
                    )}
                  </View>
                  <Text style={[
                    styles.navLabel,
                    isActive && styles.activeNavLabel
                  ]}>
                    {isProfile && !user ? 'Login' : item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 20,
    right: 20,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 100,
  },
  blurContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 30,
  },
  navItemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  icon: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  activeIcon: {
    textShadowColor: 'rgba(99, 102, 241, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  navLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  activeNavLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
  generateButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  generateButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  generateButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  generateLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 6,
  },
});

export default FloatingNavbar; 