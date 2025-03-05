import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import Header from './components/Header';
import Footer from './components/Footer';
import FirebaseDiagnosticsProvider from './components/FirebaseDiagnosticsProvider';

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
            <FirebaseDiagnosticsProvider />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
