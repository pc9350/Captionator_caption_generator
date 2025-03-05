'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the FirebaseDiagnostics component with ssr: false
const FirebaseDiagnostics = dynamic(
  () => import('./FirebaseDiagnostics'),
  { ssr: false }
);

export default function FirebaseDiagnosticsProvider() {
  return (
    <Suspense fallback={null}>
      <FirebaseDiagnostics />
    </Suspense>
  );
} 