import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  primary?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: string[];
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  primary = true,
  icon,
  style,
  textStyle,
  gradientColors,
  disabled = false,
  loading = false,
  size = 'medium',
  fullWidth = false,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Fade in animation
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    
    // Loading animation
    if (loading) {
      Animated.loop(
        Animated.timing(loadingAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [loading]);
  
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  const getButtonHeight = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'large':
        return 56;
      default:
        return 48;
    }
  };
  
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };
  
  const getButtonColors = (): [string, string] => {
    if (gradientColors && gradientColors.length >= 2) {
      return [gradientColors[0], gradientColors[1]];
    }
    return primary 
      ? ['#4f46e5', '#4338ca'] 
      : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'];
  };
  
  const spin = loadingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <Animated.View
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
          height: getButtonHeight(),
        },
        style,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.button, fullWidth && styles.fullWidth]}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={getButtonColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            { opacity: disabled ? 0.5 : 1 },
            fullWidth && styles.fullWidth,
          ]}
        >
          {loading ? (
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="refresh" size={24} color="#fff" />
            </Animated.View>
          ) : (
            <View style={styles.contentContainer}>
              {icon && (
                <Ionicons
                  name={icon as any}
                  size={size === 'small' ? 16 : 20}
                  color={primary ? '#fff' : '#e0e7ff'}
                  style={styles.icon}
                />
              )}
              <Text
                style={[
                  styles.text,
                  { fontSize: getFontSize() },
                  primary ? styles.primaryText : styles.secondaryText,
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fullWidth: {
    width: '100%',
  },
  button: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#e0e7ff',
  },
  icon: {
    marginRight: 8,
  },
});

export default AnimatedButton; 