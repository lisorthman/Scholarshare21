'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BankDetailsForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    routingNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
    </form>
  );
}