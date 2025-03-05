'use client';

import { useState, useEffect } from 'react';
import { runFirebaseDiagnostics } from '../utils/firebaseDiagnostics';

interface DiagnosticResult {
  initialized: boolean;
  online: boolean;
  firestoreConnected: boolean;
  latency?: number;
  errors: string[];
  recommendations: string[];
}

export default function FirebaseDiagnostics() {
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const result = await runFirebaseDiagnostics();
      setDiagnosticResult(result);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for Firebase errors in console
    const originalConsoleError = console.error;
    const firebaseErrorPattern = /Firebase|Firestore|WebChannel|RPC|write channel/i;
    
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      if (firebaseErrorPattern.test(errorMessage)) {
        // Auto-show diagnostics when Firebase errors are detected
        setShowDiagnostics(true);
      }
      originalConsoleError.apply(console, args);
    };
    
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  if (!showDiagnostics) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDiagnostics(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md"
        >
          Firebase Diagnostics
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Firebase Connection Diagnostics</h2>
            <button
              onClick={() => setShowDiagnostics(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close diagnostics"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md disabled:opacity-50"
            >
              {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
            </button>
          </div>

          {diagnosticResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-semibold mb-2">Firebase Initialized</h3>
                  <div className={`flex items-center ${diagnosticResult.initialized ? 'text-green-500' : 'text-red-500'}`}>
                    {diagnosticResult.initialized ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {diagnosticResult.initialized ? 'Yes' : 'No'}
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-semibold mb-2">Network Connection</h3>
                  <div className={`flex items-center ${diagnosticResult.online ? 'text-green-500' : 'text-red-500'}`}>
                    {diagnosticResult.online ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {diagnosticResult.online ? 'Online' : 'Offline'}
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-semibold mb-2">Firestore Connection</h3>
                  <div className={`flex items-center ${diagnosticResult.firestoreConnected ? 'text-green-500' : 'text-red-500'}`}>
                    {diagnosticResult.firestoreConnected ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {diagnosticResult.firestoreConnected ? 'Connected' : 'Disconnected'}
                  </div>
                  {diagnosticResult.firestoreConnected && diagnosticResult.latency && (
                    <div className="text-sm mt-1">
                      Latency: {diagnosticResult.latency}ms
                    </div>
                  )}
                </div>
              </div>

              {diagnosticResult.errors.length > 0 && (
                <div className="border rounded-md p-4 bg-red-50">
                  <h3 className="font-semibold mb-2">Errors</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {diagnosticResult.errors.map((error, index) => (
                      <li key={index} className="text-red-600">{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {diagnosticResult.recommendations.length > 0 && (
                <div className="border rounded-md p-4 bg-blue-50">
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {diagnosticResult.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="font-semibold mb-2">Common Solutions</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Check that your Firebase project is properly set up and the API key is valid.</li>
                  <li>Verify that your Firestore security rules allow the operations you're trying to perform.</li>
                  <li>Make sure you're using the latest version of the Firebase SDK.</li>
                  <li>Try clearing your browser cache and cookies.</li>
                  <li>Check if your network blocks WebSocket connections (required by Firestore).</li>
                  <li>Ensure your Firebase project has Firestore enabled and properly set up.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 