'use client';

import { useSearchParams } from 'next/navigation';

export default function BankDetailsClient() {
  const searchParams = useSearchParams();
  const bankId = searchParams.get('bankId');

  return (
    <div>
      <h1>Bank Details</h1>
      {bankId ? <p>Bank ID: {bankId}</p> : <p>No bank ID provided.</p>}
    </div>
  );
}
