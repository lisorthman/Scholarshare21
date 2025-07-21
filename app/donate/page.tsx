import { Suspense } from 'react';
import DonateClientSection from './DonateClientSection';

export default function DonatePage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <DonateClientSection />
    </Suspense>
  );
}
