import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import FloatingNavbar from '../components/FloatingNavbar';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailConfig';

// Real email sending function using EmailJS
const sendEmailDirectly = async (
  name: string, 
  email: string, 
  subject: string, 
  message: string
): Promise<boolean> => {
  try {
    // Prepare template parameters
    const templateParams = {
      from_name: name,
      from_email: email,
      subject: subject,
      message: message,
    };

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

const HelpSupportScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // Initialize EmailJS
  useEffect(() => {
    // Initialize EmailJS with your user ID
    emailjs.init(EMAILJS_CONFIG.USER_ID);
  }, []);
  
  const handleSubmit = async () => {
    // Validate form
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send email using EmailJS
      const success = await sendEmailDirectly(
        name,
        email,
        subject,
        message
      );
      
      if (success) {
        // Reset form
        setSubject('');
        setMessage('');
        
        Alert.alert(
          'Message Sent',
          'Thank you for contacting us. We will get back to you as soon as possible.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Offer fallback option to open email client
      Alert.alert(
        'Error', 
        'Failed to send message. Would you like to open your email app instead?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Open Email App',
            onPress: () => {
              const emailBody = `
Name: ${name}
Email: ${email}

${message}
              `;
              Linking.openURL(`mailto:chhabrapranav2001@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`);
            }
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:chhabrapranav2001@gmail.com');
  };

  const handleGithubPress = () => {
    Linking.openURL('https://github.com/pc9350');
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://pranavchhabra.com/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Help & Support" showBackButton={true} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          <View style={styles.headerSection}>
            <Ionicons name="help-circle" size={60} color="#4338ca" />
            <Text style={styles.headerTitle}>How can we help?</Text>
            <Text style={styles.headerSubtitle}>
              Fill out the form below and we'll get back to you as soon as possible.
            </Text>
          </View>
          
          <View style={styles.formSection}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Your email address"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Subject</Text>
              <TextInput
                style={styles.textInput}
                value={subject}
                onChangeText={setSubject}
                placeholder="What is this regarding?"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Message</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                value={message}
                onChangeText={setMessage}
                placeholder="How can we help you?"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Send Message</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.contactInfoSection}>
            <Text style={styles.contactInfoTitle}>Other Ways to Reach Us</Text>
            
            <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
              <Ionicons name="mail-outline" size={24} color="#4338ca" />
              <Text style={styles.contactItemText}>chhabrapranav2001@gmail.com</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem} onPress={handleGithubPress}>
              <Ionicons name="logo-github" size={24} color="#4338ca" />
              <Text style={styles.contactItemText}>@pc9350</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem} onPress={handleWebsitePress}>
              <Ionicons name="globe-outline" size={24} color="#4338ca" />
              <Text style={styles.contactItemText}>https://pranavchhabra.com/</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.faqSection}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How does Captionator work?</Text>
              <Text style={styles.faqAnswer}>
                Captionator uses advanced AI to analyze your images and generate relevant, 
                engaging captions tailored to your content and style preferences.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Is my data secure?</Text>
              <Text style={styles.faqAnswer}>
                Yes, we take data security seriously. Your images are processed securely 
                and are not stored permanently on our servers.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I cancel my subscription?</Text>
              <Text style={styles.faqAnswer}>
                You can cancel your subscription at any time from the Account section 
                in your Profile settings.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
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
  headerSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formSection: {
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
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1f2937',
  },
  textAreaInput: {
    minHeight: 120,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: '#4338ca',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contactInfoSection: {
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
  contactInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactItemText: {
    fontSize: 16,
    color: '#4b5563',
    marginLeft: 12,
  },
  faqSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 80, // Extra padding for the floating navbar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default HelpSupportScreen; 