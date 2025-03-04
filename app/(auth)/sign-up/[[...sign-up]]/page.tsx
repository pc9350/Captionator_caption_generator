import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Your CaptionAI Account
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Join thousands of creators generating perfect Instagram captions
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
          <SignUp
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none',
                formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
} 