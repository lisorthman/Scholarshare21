'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wallet, Building2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar'; // Add this import
import { Button } from '@/components/ui/Button';

interface PaymentData {
  totalEarnings: number;
  availableBalance: number;
  bankAccount: any;
  paperCount: number;
  approvedPapers: number;
  paymentHistory: any[];
}

export default function PaymentsPage() {
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<PaymentData>({
    totalEarnings: 0,
    availableBalance: 0,
    bankAccount: null,
    paperCount: 0,
    approvedPapers: 0,
    paymentHistory: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use static data based on your actual uploads and approvals
      setPaymentData({
        totalEarnings: 4, // $1 per approved paper (4 approved)
        availableBalance: 4,
        paperCount: 7, // total uploads
        approvedPapers: 4, // approved papers
        bankAccount: null,
        paymentHistory: []
      });

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      if (paymentData.availableBalance < 50) {
        toast.error('Minimum withdrawal amount is $50');
        return;
      }

      const res = await fetch('/api/payments/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: paymentData.availableBalance })
      });

      if (!res.ok) throw new Error('Failed to process withdrawal');

      const result = await res.json();
      if (result.success) {
        toast.success('Withdrawal request submitted successfully');
        // Refresh payment data
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to process withdrawal');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#634141]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <div className="text-destructive mb-2">
          <AlertCircle className="mx-auto h-8 w-8" />
        </div>
        <h3 className="font-medium text-[#634141]">Error loading payment data</h3>
        <p className="text-sm text-[#634141]/70 mt-2">{error}</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar onLogout={() => {
          router.push('/login');
        }} />
        <div className="flex-1 bg-[#E0D8C3] p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-8 w-1 bg-[#634141] rounded-full"></div>
                <h1 className="text-3xl font-bold text-[#634141]">
                  Research Earnings
                </h1>
              </div>
              <p className="text-[#634141]/70 text-lg ml-12 border-l-2 border-[#634141]/20 pl-4">
                Track your research paper earnings and manage withdrawals here. 
                Earn $1 for each approved paper.
              </p>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#634141]/10 rounded-full">
                    <Wallet className="text-[#634141] w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#634141]">Papers Status</h2>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-[#634141]/70">Total Uploaded</p>
                    <p className="text-2xl font-bold text-[#634141]">{paymentData.paperCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#634141]/70">Approved Papers</p>
                    <p className="text-2xl font-bold text-green-600">{paymentData.approvedPapers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#634141]/70">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {paymentData.paperCount - paymentData.approvedPapers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#634141]/10 rounded-full">
                    <TrendingUp className="text-[#634141] w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#634141]">Total Earnings</h2>
                </div>
                <p className="text-4xl font-bold text-[#634141] mb-2">
                  ${paymentData.totalEarnings}
                </p>
                <p className="text-[#634141]/70">
                  Based on {paymentData.approvedPapers} approved papers
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#634141]/10 rounded-full">
                    <Building2 className="text-[#634141] w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#634141]">Available Balance</h2>
                </div>
                <p className="text-4xl font-bold text-[#634141] mb-2">
                  ${paymentData.availableBalance}
                </p>
                {paymentData.availableBalance >= 50 ? (
                  <button
                    onClick={handleWithdraw}
                    className="mt-4 bg-[#634141] text-white px-6 py-2 rounded-lg hover:bg-[#634141]/90 transition-colors duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#634141]/50"
                  >
                    Withdraw Funds
                  </button>
                ) : (
                  <p className="text-[#634141]/70">
                    Need ${50 - paymentData.availableBalance} more to withdraw
                  </p>
                )}
              </div>
            </div>

            {/* Enhanced Bank Account Section */}
            <div className="bg-white rounded-xl p-8 shadow-lg mb-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-[#634141] mb-6 flex items-center gap-3">
                <div className="p-3 bg-[#634141]/10 rounded-full">
                  <Building2 className="text-[#634141] w-6 h-6" />
                </div>
                Bank Account
              </h2>
              {paymentData.bankAccount ? (
                <div className="space-y-4 text-[#634141]">
                  <div className="p-4 bg-[#634141]/5 rounded-lg">
                    <p className="mb-2"><span className="font-medium">Account Holder:</span> {paymentData.bankAccount.accountHolder}</p>
                    <p className="mb-2"><span className="font-medium">Bank Name:</span> {paymentData.bankAccount.bankName}</p>
                    <p><span className="font-medium">Account Number:</span> ****{paymentData.bankAccount.accountNumber.slice(-4)}</p>
                  </div>
                  <Link 
                    href="/researcher-dashboard/payments/bank-details?edit=true"
                    className="inline-block mt-4 bg-[#634141] text-white px-6 py-2 rounded-lg hover:bg-[#634141]/90 transition-colors duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#634141]/50"
                  >
                    Edit Bank Details
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#634141] mb-6">No bank account details found.</p>
                  <Link 
                    href="/researcher-dashboard/payments/bank-details"
                    className="bg-[#634141] text-white px-6 py-2 rounded-lg hover:bg-[#634141]/90 transition-colors duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#634141]/50"
                  >
                    Add Bank Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}