import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster } from "react-hot-toast";

// Safely import FirebaseDiagnosticsProvider only in development mode
// and only if the file exists
let FirebaseDiagnosticsProvider = () => null;
if (process.env.NODE_ENV === 'development') {
  try {
    // Using dynamic import to avoid build errors
    FirebaseDiagnosticsProvider = require('./components/FirebaseDiagnosticsProvider')?.default || (() => null);
  } catch (error) {
    console.log('Firebase diagnostics not available. Run npm run toggle-diagnostics to enable.');
  }
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Captionator - AI-Powered Instagram Caption Generator",
  description: "Generate engaging, context-aware Instagram captions with AI. Upload your images and get captions that match your style and tone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            {process.env.NODE_ENV === 'development' && <FirebaseDiagnosticsProvider />}
            <Toaster 
              position="bottom-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#22c55e',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
