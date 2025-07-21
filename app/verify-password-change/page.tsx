import { Suspense } from 'react';
import VerifyPasswordChangeClient from './VerifyPasswordChangeClient';

export default function VerifyPasswordChangePage() {
  return (
    <Suspense fallback={<div>Verifying password change...</div>}>
      <VerifyPasswordChangeClient />
    </Suspense>
  );
}