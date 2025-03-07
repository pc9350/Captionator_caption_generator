import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import FooterNavbar from '../components/FooterNavbar';
import { Ionicons } from '@expo/vector-icons';
import FloatingNavbar from '../components/FloatingNavbar';
import { useNavigation, CommonActions } from '@react-navigation/native';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = React.useState(true);
  const navigation = useNavigation();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditProfile = () => {
    // Navigate to Edit Profile screen
    navigation.dispatch(
      CommonActions.navigate({
        name: 'EditProfile'
      })
    );
  };

  const handlePrivacySettings = () => {
    // Navigate to Privacy Policy screen
    navigation.dispatch(
      CommonActions.navigate({
        name: 'PrivacyPolicy'
      })
    );
  };

  const handleHelpSupport = () => {
    // Navigate to Help & Support screen
    navigation.dispatch(
      CommonActions.navigate({
        name: 'HelpSupport'
      })
    );
  };

  const handleChangePassword = () => {
    // Navigate to Change Password screen
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ChangePassword'
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Profile" />
      
      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {user?.photoURL ? (
              <Image 
                source={{ uri: user.photoURL }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitial}>
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.profileName}>
            {user?.displayName || 'User'}
          </Text>
          <Text style={styles.profileEmail}>
            {user?.email || 'No email'}
          </Text>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color="#4b5563" />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
              thumbColor={notifications ? '#4338ca' : '#f4f3f4'}
            />
          </View>
        </View>
        
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.accountItem}
            onPress={handleChangePassword}
          >
            <Ionicons name="lock-closed-outline" size={24} color="#4b5563" />
            <Text style={styles.accountItemText}>Change Password</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.accountItem}
            onPress={handlePrivacySettings}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#4b5563" />
            <Text style={styles.accountItemText}>Privacy Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.accountItem}
            onPress={handleHelpSupport}
          >
            <Ionicons name="help-circle-outline" size={24} color="#4b5563" />
            <Text style={styles.accountItemText}>Help & Support</Text>
            <Text style={styles.newFeatureBadge}>New</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.accountItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text style={[styles.accountItemText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
        
        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Captionator v1.0.0</Text>
          <TouchableOpacity onPress={handlePrivacySettings}>
            <Text style={styles.privacyLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.appCopyright}>
            © {new Date().getFullYear()} Captionator. All rights reserved.
          </Text>
        </View>
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
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  editProfileButtonText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#4b5563',
    marginLeft: 12,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  accountItemText: {
    fontSize: 16,
    color: '#4b5563',
    marginLeft: 12,
    flex: 1,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#ef4444',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appVersion: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#9ca3af',
  },
  privacyLink: {
    fontSize: 14,
    color: '#6366f1',
    marginVertical: 8,
    textDecorationLine: 'underline',
  },
  newFeatureBadge: {
    fontSize: 12,
    color: '#ffffff',
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 8,
  },
});

export default ProfileScreen; 