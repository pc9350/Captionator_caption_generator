import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

const FooterNavbar = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const navigateTo = (screenName: string) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: screenName as never,
      })
    );
  };

  return (
    <View style={styles.container}>
      {/* Home Button */}
      <TouchableOpacity 
        style={styles.navButton} 
        onPress={() => navigateTo('Home')}
      >
        <Ionicons name="home-outline" size={24} color="#4338ca" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      {/* Features Button */}
      <TouchableOpacity 
        style={styles.navButton} 
        onPress={() => navigateTo('Features')}
      >
        <Ionicons name="list-outline" size={24} color="#4338ca" />
        <Text style={styles.navText}>Features</Text>
      </TouchableOpacity>

      {/* Generate Button (Dashboard) */}
      <TouchableOpacity 
        style={styles.centerButton} 
        onPress={() => navigateTo(user ? 'Dashboard' : 'Auth')}
      >
        <View style={styles.centerButtonInner}>
          <Ionicons name="add-outline" size={28} color="white" />
        </View>
      </TouchableOpacity>

      {/* Saved Captions Button (or Login if not authenticated) */}
      <TouchableOpacity 
        style={styles.navButton} 
        onPress={() => navigateTo(user ? 'SavedCaptions' : 'Auth')}
      >
        <Ionicons name="bookmark-outline" size={24} color="#4338ca" />
        <Text style={styles.navText}>{user ? 'Saved' : 'Login'}</Text>
      </TouchableOpacity>

      {/* Profile Button (or Login if not authenticated) */}
      <TouchableOpacity 
        style={styles.navButton} 
        onPress={() => navigateTo(user ? 'Profile' : 'Auth')}
      >
        <Ionicons name="person-outline" size={24} color="#4338ca" />
        <Text style={styles.navText}>{user ? 'Profile' : 'Sign Up'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#4b5563',
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    marginTop: -30,
  },
  centerButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4338ca',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});

export default FooterNavbar; 