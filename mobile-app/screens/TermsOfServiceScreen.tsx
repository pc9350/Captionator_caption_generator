import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Header from '../components/Header';
import FloatingNavbar from '../components/FloatingNavbar';

const TermsOfServiceScreen = () => {
  // Get current date in format: June 15, 2023
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Terms of Service" showBackButton={true} />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last Updated: {formattedDate}</Text>
          
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            Welcome to Captionator. By downloading, installing, or using our mobile application, you agree 
            to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do 
            not use our app.
          </Text>
          
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            Captionator is a mobile application that uses artificial intelligence to generate captions for 
            images. Our service allows users to upload images, generate captions, save favorite captions, 
            and customize their profile.
          </Text>
          
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            To use certain features of our app, you may need to create an account. You are responsible for 
            maintaining the confidentiality of your account credentials and for all activities that occur 
            under your account. You agree to provide accurate and complete information when creating your 
            account and to update your information as necessary.
          </Text>
          
          <Text style={styles.sectionTitle}>4. User Content</Text>
          <Text style={styles.paragraph}>
            Our app allows you to upload images for caption generation and to set a profile picture. By 
            uploading content to our app, you:
          </Text>
          <Text style={styles.bulletPoint}>• Retain all ownership rights to your content</Text>
          <Text style={styles.bulletPoint}>• Grant us a non-exclusive, royalty-free license to use, process, and store your content solely for the purpose of providing our services to you</Text>
          <Text style={styles.bulletPoint}>• Represent that you have the right to upload and share the content</Text>
          <Text style={styles.bulletPoint}>• Understand that profile pictures are stored in our database to enable cross-device access to your profile</Text>
          
          <Text style={styles.sectionTitle}>5. Prohibited Content</Text>
          <Text style={styles.paragraph}>
            You agree not to upload or share content that:
          </Text>
          <Text style={styles.bulletPoint}>• Is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</Text>
          <Text style={styles.bulletPoint}>• Infringes on the intellectual property rights of others</Text>
          <Text style={styles.bulletPoint}>• Contains sexually explicit material, violence, or discrimination</Text>
          <Text style={styles.bulletPoint}>• Promotes illegal activities or violates any applicable laws</Text>
          <Text style={styles.paragraph}>
            We reserve the right to remove any content that violates these Terms and to terminate accounts 
            of users who repeatedly violate these Terms.
          </Text>
          
          <Text style={styles.sectionTitle}>6. Data Storage and Privacy</Text>
          <Text style={styles.paragraph}>
            We store the following data in our Firebase Firestore database:
          </Text>
          <Text style={styles.bulletPoint}>• Your account information (email, display name)</Text>
          <Text style={styles.bulletPoint}>• Your profile picture (in base64 format)</Text>
          <Text style={styles.bulletPoint}>• Your saved captions</Text>
          <Text style={styles.paragraph}>
            Images uploaded for caption generation are not permanently stored beyond the time needed to 
            generate captions. For more information on how we collect, use, and protect your data, please 
            refer to our Privacy Policy.
          </Text>
          
          <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The app, including its content, features, and functionality, is owned by Captionator and is 
            protected by copyright, trademark, and other intellectual property laws. You may not reproduce, 
            distribute, modify, create derivative works of, publicly display, or exploit our app or its 
            content without our permission.
          </Text>
          
          <Text style={styles.sectionTitle}>8. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            Our app integrates with third-party services, including:
          </Text>
          <Text style={styles.bulletPoint}>• Google Firebase for authentication and data storage</Text>
          <Text style={styles.bulletPoint}>• OpenAI API for caption generation</Text>
          <Text style={styles.bulletPoint}>• Expo services for app functionality</Text>
          <Text style={styles.paragraph}>
            Your use of these third-party services is subject to their respective terms of service and 
            privacy policies.
          </Text>
          
          <Text style={styles.sectionTitle}>9. Disclaimer of Warranties</Text>
          <Text style={styles.paragraph}>
            THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
            OR IMPLIED. WE DO NOT GUARANTEE THAT THE APP WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </Text>
          
          <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER 
            INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </Text>
          
          <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may update these Terms from time to time. We will notify you of any changes by posting the 
            new Terms on this page and updating the "Last Updated" date. Continued use of the app after 
            such changes constitutes your acceptance of the new Terms.
          </Text>
          
          <Text style={styles.sectionTitle}>12. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account and access to our app at any time, without prior notice 
            or liability, for any reason, including if you violate these Terms. Upon termination, your right 
            to use the app will immediately cease.
          </Text>
          
          <Text style={styles.sectionTitle}>13. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
            in which we operate, without regard to its conflict of law provisions.
          </Text>
          
          <Text style={styles.sectionTitle}>14. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: chhabrapranav2001@gmail.com</Text>
          <Text style={styles.contactInfo}>Website: https://pranavchhabra.com</Text>
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
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 80, // Extra padding for the floating navbar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 16,
    color: '#4338ca',
    marginLeft: 16,
    marginBottom: 8,
  },
});

export default TermsOfServiceScreen; 