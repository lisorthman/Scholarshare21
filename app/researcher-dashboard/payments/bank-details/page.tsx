import { Suspense } from 'react';
import BankDetailsClient from './BankDetailsClient';

export default function BankDetailsPage() {
  return (
    <Suspense fallback={<div>Loading bank details...</div>}>
      <BankDetailsClient />
    </Suspense>
  );
}
