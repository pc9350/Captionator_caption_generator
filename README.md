# Captionator - AI-Powered Instagram Caption Generator

Captionator is a modern web application that uses AI to generate engaging and creative captions for your posts. Simply upload an image, select a tone, and get multiple caption options tailored to your content.

## Features

- **AI-Powered Caption Generation**: Leverages OpenAI to create contextually relevant captions based on your images
- **Multiple Tone Options**: Choose from casual, professional, funny, inspirational, or storytelling tones
- **Save Favorite Captions**: Save your favorite captions for later use
- **Caption History**: View your past caption generations
- **User Authentication**: Secure user accounts with Firebase Authentication
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **Dark Mode Support**: Comfortable viewing in any lighting condition

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **AI**: OpenAI API
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- OpenAI API key
- Firebase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/captionator.git
   cd captionator
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key_here

   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id_here

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Sign up or log in to your account
2. Upload an image from your device
3. Select a tone for your caption
4. Click "Generate Captions" to get AI-generated captions
5. Copy, save, or regenerate captions as needed
6. View your saved captions or caption history in the respective sections

## License

This project is licensed under the MIT License - see the LICENSE file for details.
