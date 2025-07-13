'use client';
import { useEffect, useState } from 'react';

interface Payment {
  amount: number;
  status: string;
  paymentDate: string;
  transactionId: string;
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    // Fetch payment history
  }, []);

  return (
    <div className="space-y-4">
      {/* Payment history display */}
    </div>
  );
}