'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar'; // Add this import
import Link from 'next/link';

export default function BankDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === 'true';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    routingNumber: ''
  });

  // Fetch existing bank details if editing
  useEffect(() => {
    if (isEdit) {
      fetchBankDetails();
    }
  }, [isEdit]);

  const fetchBankDetails = async () => {
    try {
      const res = await fetch('/api/payments');
      if (!res.ok) throw new Error('Failed to fetch bank details');
      
      const data = await res.json();
      if (data.bankAccount) {
        setFormData(data.bankAccount);
      }
    } catch (err) {
      setError('Failed to load bank details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form data
    if (!formData.accountHolder || !formData.bankName || 
        !formData.accountNumber || !formData.routingNumber) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate routing number format
    if (!/^\d{9}$/.test(formData.routingNumber)) {
      setError('Routing number must be 9 digits');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/payments/bank-account', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bankDetails: formData
        }),
      });

      if (!res.ok) throw new Error('Failed to save bank details');

      router.push('/researcher-dashboard/payments');
    } catch (err: any) {
      setError(err.message || 'Failed to save bank details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar onLogout={() => {
          // Implement your logout logic here, e.g., redirect to login or clear auth
          router.push('/logout');
        }} />
        <div className="flex-1 bg-[#E0D8C3] p-6">
          <div className="max-w-2xl mx-auto">
            {/* Back Button */}
            <Link 
              href="/researcher-dashboard/payments"
              className="inline-flex items-center text-[#634141] hover:text-[#634141]/80 mb-6 transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Payments
            </Link>

            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-[#634141]/10 rounded-full">
                  <Building2 className="text-[#634141] w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-[#634141]">
                  {isEdit ? 'Edit Bank Account Details' : 'Add Bank Account Details'}
                </h1>
              </div>

              {/* Add Information Section */}
              <div className="bg-[#634141]/5 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold text-[#634141] mb-2">
                  Important Information
                </h2>
                <ul className="space-y-2 text-[#634141]/80 text-sm">
                  <li>• All fields marked with <span className="text-red-500">*</span> are required</li>
                  <li>• Routing number must be 9 digits</li>
                  <li>• Please double-check all details before submitting</li>
                  <li>• Bank account details are required for withdrawals</li>
                  <li>• You can update these details at any time</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[#634141] font-medium">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({...formData, accountHolder: e.target.value})}
                    className="w-full p-3 border border-[#634141]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#634141]/50 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[#634141] font-medium">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    className="w-full p-3 border border-[#634141]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#634141]/50 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[#634141] font-medium">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    className="w-full p-3 border border-[#634141]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#634141]/50 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[#634141] font-medium">
                    Routing Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="routingNumber"
                    value={formData.routingNumber}
                    onChange={(e) => setFormData({...formData, routingNumber: e.target.value})}
                    className="w-full p-3 border border-[#634141]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#634141]/50 transition-all duration-300"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#634141] text-white py-3 px-6 rounded-lg hover:bg-[#634141]/90 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#634141]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : isEdit ? 'Update Bank Details' : 'Save Bank Details'}
                </button>
              </form>

              {/* Additional Information Section */}
              <div className="mt-8 bg-blue-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-[#634141] mb-2">
                  Additional Information
                </h2>
                <div className="space-y-2 text-[#634141]/80 text-sm">
                  <p className="mb-2">
                    <span className="font-medium text-blue-600">Important Note:</span> You can provide bank account details of your preferred person (e.g., parent, guardian, or trusted individual) for receiving payments.
                  </p>
                  <ul className="space-y-2">
                    <li>• The account holder can be different from your registered name</li>
                    <li>• Ensure you have permission from the account holder</li>
                    <li>• All payments will be sent to the provided bank account</li>
                    <li>• Keep the account details up to date</li>
                    <li>• Verify the accuracy of all information before saving</li>
                  </ul>

                  {/* Added Routing Number Explanation */}
                  <div className="mt-4 p-3 bg-white rounded border border-blue-100">
                    <p className="font-medium text-[#634141] mb-1">What is a Routing Number?</p>
                    <p className="text-[#634141]/80">
                      A routing number is a 9-digit code that identifies your bank in the US banking system. You can find it:
                    </p>
                    <ul className="mt-2 space-y-1">
                      <li>• On the bottom left of your checks</li>
                      <li>• Through your online banking account</li>
                      <li>• By contacting your bank directly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}