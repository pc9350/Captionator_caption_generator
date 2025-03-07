// EmailJS configuration
// You'll need to create an account at emailjs.com and set up a service and template
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_captionator', // Replace with your service ID
  TEMPLATE_ID: 'template_contact_form', // Replace with your template ID
  USER_ID: 'YOUR_USER_ID', // Replace with your user ID
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY', // Replace with your public key
};

// Instructions for setting up EmailJS:
// 1. Create an account at https://www.emailjs.com/
// 2. Create a service (e.g., Gmail, Outlook, etc.)
// 3. Create an email template with the following variables:
//    - {{from_name}} - The name of the sender
//    - {{from_email}} - The email of the sender
//    - {{subject}} - The subject of the message
//    - {{message}} - The message content
// 4. Get your User ID and Public Key from the EmailJS dashboard
// 5. Replace the placeholder values above with your actual credentials 