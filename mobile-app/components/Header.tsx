import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  customBackAction?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBackButton = true,
  rightComponent,
  customBackAction
}) => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    if (customBackAction) {
      customBackAction();
      return;
    }
    
    // Check if we can go back
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If we can't go back, navigate to Home as a fallback
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Home'
        })
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleGoBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={28} color="#4338ca" />
          </TouchableOpacity>
        )}
        
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.rightContainer}>
          {rightComponent}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    zIndex: 10, // Ensure header is above other elements
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 64, // Increase height to ensure back button is fully visible
  },
  backButton: {
    padding: 8, // Increase padding for larger touch area
    marginLeft: -8, // Offset the padding to maintain alignment
    width: 44, // Fixed width to ensure proper alignment
    height: 44, // Fixed height to ensure proper alignment
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4338ca',
    flex: 1,
    textAlign: 'center',
  },
  rightContainer: {
    width: 44, // Same width as back button for balance
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default Header; 