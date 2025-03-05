import { db, isFirebaseInitialized } from '../firebase/config';
import { collection, getDocs, limit, query } from 'firebase/firestore';

/**
 * Firebase Diagnostics Utility
 * 
 * This utility provides functions to diagnose and troubleshoot Firebase connection issues.
 * It can be used to check if Firebase is properly initialized, test connectivity,
 * and provide detailed error information.
 */

// Check if Firebase is properly initialized
export const checkFirebaseInitialization = (): { 
  initialized: boolean; 
  details: string;
} => {
  const initialized = isFirebaseInitialized();
  
  return {
    initialized,
    details: initialized 
      ? 'Firebase is properly initialized.' 
      : 'Firebase is not properly initialized. Check your environment variables and configuration.'
  };
};

// Test Firestore connectivity by attempting a simple read operation
export const testFirestoreConnectivity = async (): Promise<{
  success: boolean;
  latency?: number;
  error?: string;
  details: string;
}> => {
  if (!isFirebaseInitialized()) {
    return {
      success: false,
      error: 'Firebase not initialized',
      details: 'Firebase is not properly initialized. Cannot test connectivity.'
    };
  }
  
  const startTime = Date.now();
  
  try {
    // Try to fetch a single document from any collection
    const collections = ['savedCaptions', 'captionHistory'];
    let success = false;
    
    for (const collectionName of collections) {
      try {
        const q = query(collection(db, collectionName), limit(1));
        await getDocs(q);
        success = true;
        break;
      } catch (err) {
        // Try the next collection
        continue;
      }
    }
    
    if (!success) {
      throw new Error('Could not connect to any collection');
    }
    
    const latency = Date.now() - startTime;
    
    return {
      success: true,
      latency,
      details: `Successfully connected to Firestore. Latency: ${latency}ms`
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      success: false,
      error: errorMessage,
      details: `Failed to connect to Firestore: ${errorMessage}`
    };
  }
};

// Check network connectivity
export const checkNetworkConnectivity = (): {
  online: boolean;
  details: string;
} => {
  if (typeof navigator === 'undefined') {
    return {
      online: true,
      details: 'Running in server environment, network status unavailable.'
    };
  }
  
  const online = navigator.onLine;
  
  return {
    online,
    details: online 
      ? 'Device is online.' 
      : 'Device is offline. Check your internet connection.'
  };
};

// Run all diagnostics
export const runFirebaseDiagnostics = async (): Promise<{
  initialized: boolean;
  online: boolean;
  firestoreConnected: boolean;
  latency?: number;
  errors: string[];
  recommendations: string[];
}> => {
  const errors: string[] = [];
  const recommendations: string[] = [];
  
  // Check initialization
  const initCheck = checkFirebaseInitialization();
  if (!initCheck.initialized) {
    errors.push(initCheck.details);
    recommendations.push('Verify your Firebase configuration and environment variables.');
  }
  
  // Check network
  const networkCheck = checkNetworkConnectivity();
  if (!networkCheck.online) {
    errors.push(networkCheck.details);
    recommendations.push('Connect to the internet and try again.');
  }
  
  // Check Firestore connectivity
  const connectivityCheck = await testFirestoreConnectivity();
  if (!connectivityCheck.success) {
    errors.push(connectivityCheck.details);
    
    if (connectivityCheck.error?.includes('permission-denied')) {
      recommendations.push('Check your Firestore security rules.');
    } else if (connectivityCheck.error?.includes('unavailable')) {
      recommendations.push('Firestore service might be down or unreachable. Try again later.');
    } else if (connectivityCheck.error?.includes('deadline-exceeded')) {
      recommendations.push('Connection timed out. Check your network speed and firewall settings.');
    } else {
      recommendations.push('Check browser console for detailed error messages.');
    }
  }
  
  // Add general recommendations if there are errors
  if (errors.length > 0) {
    recommendations.push('Try clearing browser cache and cookies.');
    recommendations.push('Try using a different browser or network connection.');
  }
  
  return {
    initialized: initCheck.initialized,
    online: networkCheck.online,
    firestoreConnected: connectivityCheck.success,
    latency: connectivityCheck.latency,
    errors,
    recommendations
  };
}; 