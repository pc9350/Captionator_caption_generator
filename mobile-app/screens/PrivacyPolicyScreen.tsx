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

const PrivacyPolicyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Privacy Policy" showBackButton={true} />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>
          
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to Captionator ("we," "our," or "us"). We are committed to protecting your privacy 
            and ensuring you have a positive experience when using our app. This Privacy Policy explains 
            how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>
          <Text style={styles.paragraph}>
            Please read this Privacy Policy carefully. By accessing or using our app, you acknowledge that 
            you have read, understood, and agree to be bound by all the terms outlined in this Privacy Policy.
          </Text>
          
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.subSectionTitle}>2.1 Personal Information</Text>
          <Text style={styles.paragraph}>
            We may collect personal information that you voluntarily provide to us when you:
          </Text>
          <Text style={styles.bulletPoint}>• Register for an account</Text>
          <Text style={styles.bulletPoint}>• Use our caption generation features</Text>
          <Text style={styles.bulletPoint}>• Contact our customer support</Text>
          <Text style={styles.bulletPoint}>• Participate in promotions or surveys</Text>
          <Text style={styles.paragraph}>
            This information may include your name, email address, profile picture, and other details 
            necessary to provide our services.
          </Text>
          
          <Text style={styles.subSectionTitle}>2.2 Images and Content</Text>
          <Text style={styles.paragraph}>
            When you use our caption generation features, we process the images you upload to generate 
            captions. These images are processed securely and are not permanently stored on our servers 
            beyond the time needed to generate captions.
          </Text>
          
          <Text style={styles.subSectionTitle}>2.3 Usage Information</Text>
          <Text style={styles.paragraph}>
            We automatically collect certain information about your device and how you interact with our app, 
            including:
          </Text>
          <Text style={styles.bulletPoint}>• Device information (model, operating system)</Text>
          <Text style={styles.bulletPoint}>• IP address and location information</Text>
          <Text style={styles.bulletPoint}>• App usage statistics and preferences</Text>
          <Text style={styles.bulletPoint}>• Error logs and performance data</Text>
          
          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide, maintain, and improve our services</Text>
          <Text style={styles.bulletPoint}>• Process and generate captions for your images</Text>
          <Text style={styles.bulletPoint}>• Communicate with you about updates and features</Text>
          <Text style={styles.bulletPoint}>• Respond to your inquiries and support requests</Text>
          <Text style={styles.bulletPoint}>• Monitor and analyze usage patterns and trends</Text>
          <Text style={styles.bulletPoint}>• Detect, prevent, and address technical issues</Text>
          
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your personal 
            information against unauthorized access, alteration, disclosure, or destruction. However, 
            no method of transmission over the Internet or electronic storage is 100% secure, and we 
            cannot guarantee absolute security.
          </Text>
          
          <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            Our app may integrate with third-party services, such as analytics providers and AI services. 
            These third parties may collect information about you when you use our app. We encourage you 
            to review the privacy policies of these third parties.
          </Text>
          
          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.paragraph}>
            Depending on your location, you may have certain rights regarding your personal information, 
            including:
          </Text>
          <Text style={styles.bulletPoint}>• Access to your personal information</Text>
          <Text style={styles.bulletPoint}>• Correction of inaccurate information</Text>
          <Text style={styles.bulletPoint}>• Deletion of your personal information</Text>
          <Text style={styles.bulletPoint}>• Objection to certain processing activities</Text>
          <Text style={styles.paragraph}>
            To exercise these rights, please contact us using the information provided in the "Contact Us" 
            section.
          </Text>
          
          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our app is not intended for children under the age of 13. We do not knowingly collect personal 
            information from children under 13. If you are a parent or guardian and believe your child has 
            provided us with personal information, please contact us.
          </Text>
          
          <Text style={styles.sectionTitle}>8. Changes to This Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
            the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to 
            review this Privacy Policy periodically for any changes.
          </Text>
          
          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions or concerns about this Privacy Policy or our data practices, please 
            contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: privacy@captionator.com</Text>
          <Text style={styles.contactInfo}>Address: 123 AI Avenue, Tech City, TC 12345</Text>
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

export default PrivacyPolicyScreen; 