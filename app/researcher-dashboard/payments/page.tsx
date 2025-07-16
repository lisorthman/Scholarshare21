'use client';
import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  CreditCard,
  XCircle,
  RefreshCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface PaperReward {
  paperId: string;
  paperTitle: string;
  submittedAt: string;
  approvedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  rewardAmount: number;
  rewardPaid: boolean;
}

interface Withdrawal {
  id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed';
  requestedAt: string;
  processedAt: string;
  bankDetails: {
    accountNumber: string;
    bankName: string;
  };
}

interface PaymentData {
  _id: string;
  bankDetails?: {
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    accountHolderName?: string;
  };
  earnings: {
    totalEarned: number;
    availableBalance: number;
    totalWithdrawn: number;
    currency: string;
  };
  paperRewards: PaperReward[];
  withdrawals: Withdrawal[];
  withdrawalSettings: {
    minimumAmount: number;
  };
  status: 'active' | 'suspended';
}

export default function ResearcherEarningsPage() {
  const [user, setUser] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    accountHolderName: ''
  });

  useEffect(() => {
    const initializeData = async () => {
      await verifyUserAndFetchData();
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (paymentData?.bankDetails) {
      setBankDetails({
        accountNumber: paymentData.bankDetails.accountNumber || '',
        routingNumber: paymentData.bankDetails.routingNumber || '',
        bankName: paymentData.bankDetails.bankName || '',
        accountHolderName: paymentData.bankDetails.accountHolderName || ''
      });
    }
  }, [paymentData]);

  const verifyUserAndFetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        window.location.href = '/login';
        return;
      }

      // Verify token and get user info
      const userResponse = await fetch('/api/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const userData = await userResponse.json();
      
      if (!userData.valid) {
        setError('Invalid session. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (userData.user.role !== 'researcher') {
        setError('Access denied. Researcher role required.');
        return;
      }

      setUser(userData.user);
      console.log('Verified user:', userData.user);
      
      // Now fetch payment data with researcher ID
      await fetchPaymentData(userData.user._id);
      
    } catch (err: any) {
      console.error('Error during initialization:', err);
      setError(err.message || 'Failed to initialize application');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentData = async (researcherId?: string) => {
    try {
      const userId = researcherId || user?._id;
      
      if (!userId) {
        throw new Error('User ID not available');
      }

      console.log('Fetching payment data for researcher:', userId);
      
      const response = await fetch(`/api/payments?researcherId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payment data');
      }
      
      const data = await response.json();
      console.log('Received payment data:', data);
      
      // Ensure all required properties exist with defaults
      const processedData = {
        ...data,
        bankDetails: data.bankDetails || {},
        earnings: data.earnings || {
          totalEarned: 0,
          availableBalance: 0,
          totalWithdrawn: 0,
          currency: 'USD'
        },
        paperRewards: data.paperRewards || [],
        withdrawals: data.withdrawals || [],
        withdrawalSettings: data.withdrawalSettings || {
          minimumAmount: 20
        }
      };
      
      setPaymentData(processedData);
      
    } catch (err: any) {
      console.error('Error fetching payment data:', err);
      setError(err.message || 'Failed to load earnings information');
    }
  };

  const refreshData = async () => {
    if (!user?._id) {
      setError('User not authenticated');
      return;
    }
    
    setRefreshing(true);
    await fetchPaymentData(user._id);
    setRefreshing(false);
  };

  const handleWithdrawalRequest = async () => {
    try {
      const amount = parseFloat(withdrawalAmount);
      
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      if (!paymentData?.earnings) {
        alert('Payment data not available');
        return;
      }

      if (!user?._id) {
        alert('User not authenticated');
        return;
      }

      if (amount < (paymentData.withdrawalSettings?.minimumAmount || 20)) {
        alert(`Minimum withdrawal amount is $${paymentData.withdrawalSettings?.minimumAmount || 20}`);
        return;
      }

      if (amount > paymentData.earnings.availableBalance) {
        alert('Insufficient available balance');
        return;
      }
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'requestWithdrawal',
          researcherId: user._id,
          data: { amount }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const updatedData = await response.json();
      
      // Ensure the updated data has proper structure
      const processedUpdatedData = {
        ...updatedData,
        bankDetails: updatedData.bankDetails || {},
        earnings: updatedData.earnings || {
          totalEarned: 0,
          availableBalance: 0,
          totalWithdrawn: 0,
          currency: 'USD'
        },
        paperRewards: updatedData.paperRewards || [],
        withdrawals: updatedData.withdrawals || [],
        withdrawalSettings: updatedData.withdrawalSettings || {
          minimumAmount: 20
        }
      };
      
      setPaymentData(processedUpdatedData);
      setShowWithdrawalForm(false);
      setWithdrawalAmount('');
      
      alert(`Withdrawal of $${amount.toFixed(2)} has been processed successfully!`);
      
    } catch (err: any) {
      console.error('Error requesting withdrawal:', err);
      alert(err.message || 'Failed to request withdrawal');
    }
  };

  const handleBankDetailsUpdate = async () => {
    try {
      if (!bankDetails.accountNumber || !bankDetails.bankName) {
        alert('Please fill in required bank details (Account Number and Bank Name)');
        return;
      }

      if (!user?._id) {
        alert('User not authenticated');
        return;
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateBankDetails',
          researcherId: user._id,
          data: bankDetails
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const updatedData = await response.json();
      
      // Ensure the updated data has proper structure
      const processedUpdatedData = {
        ...updatedData,
        bankDetails: updatedData.bankDetails || {},
        earnings: updatedData.earnings || {
          totalEarned: 0,
          availableBalance: 0,
          totalWithdrawn: 0,
          currency: 'USD'
        },
        paperRewards: updatedData.paperRewards || [],
        withdrawals: updatedData.withdrawals || [],
        withdrawalSettings: updatedData.withdrawalSettings || {
          minimumAmount: 20
        }
      };
      
      setPaymentData(processedUpdatedData);
      setShowBankForm(false);
      
      alert('Bank details updated successfully!');
      
    } catch (err: any) {
      console.error('Error updating bank details:', err);
      alert(err.message || 'Failed to update bank details');
    }
  };

  // Safe accessors with defaults
  const earnings = paymentData?.earnings || {
    totalEarned: 0,
    availableBalance: 0,
    totalWithdrawn: 0,
    currency: 'USD'
  };

  const withdrawalSettings = paymentData?.withdrawalSettings || {
    minimumAmount: 20
  };

  const canWithdraw = paymentData && 
    earnings.availableBalance >= withdrawalSettings.minimumAmount &&
    paymentData.bankDetails?.accountNumber;

  const approvedPapers = paymentData?.paperRewards?.filter(p => p.status === 'approved') || [];
  const pendingPapers = paymentData?.paperRewards?.filter(p => p.status === 'pending') || [];
  const rejectedPapers = paymentData?.paperRewards?.filter(p => p.status === 'rejected') || [];

  if (loading || !user) {
    return (
      <DashboardLayout user={user} defaultPage="Earnings">
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ minHeight: '100vh', width: '100%' }}
        >
          <div
            className="shadow-lg flex flex-col items-center justify-center"
            style={{
              background: '#fff',
              borderRadius: '2.5rem',
              maxWidth: '1200px', // increased width
              width: '100%',
              minHeight: '80vh',
              padding: '3rem 2.5rem',
              boxSizing: 'border-box',
              boxShadow: '0 8px 32px rgba(99,65,65,0.10)',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2.5rem',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#634141] mx-auto mb-4"></div>
            <p className="text-[#634141] text-lg font-semibold">Loading earnings data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !paymentData) {
    return (
      <DashboardLayout user={user} defaultPage="Earnings">
        <div className="bg-[#E0D8C3] min-h-screen p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-[#634141] mb-4">Unable to Load Earnings</h1>
              <p className="text-[#634141]/70 mb-6">{error || 'Failed to load earnings information'}</p>
              <button
                onClick={verifyUserAndFetchData}
                className="px-6 py-2 bg-[#634141] text-white rounded-lg hover:bg-[#634141]/90"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} defaultPage="Earnings">
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ minHeight: '100vh', width: '100%' }}
      >
        <div
          className="shadow-lg"
          style={{
            background: '#fff',
            borderRadius: '2.5rem', // more curve
            maxWidth: '1200px', // balanced width
            width: '100%',
            minHeight: '80vh',
            padding: '3rem 2.5rem', // more padding
            boxSizing: 'border-box',
            boxShadow: '0 8px 32px rgba(99,65,65,0.10)',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2.5rem',
          }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-[#634141] mb-2">
                  Your Earnings
                </h1>
                <p className="text-[#634141]/70">Track your research earnings: $1 per approved paper</p>
              </div>
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Earnings Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-[#634141]/70">Papers Submitted</p>
                  <p className="text-2xl font-bold text-[#634141]">
                    {paymentData.paperRewards?.length || 0}
                  </p>
                  <p className="text-xs text-blue-600">Total submissions</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-[#634141]/70">Papers Approved</p>
                  <p className="text-2xl font-bold text-[#634141]">
                    {approvedPapers.length}
                  </p>
                  <p className="text-xs text-green-600">
                    ${approvedPapers.length} earned
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-[#634141]/70">Available Balance</p>
                  <p className="text-2xl font-bold text-[#634141]">
                    ${earnings.availableBalance.toFixed(2)}
                  </p>
                  <p className={`text-xs ${
                    canWithdraw ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {canWithdraw ? 'Ready to withdraw' : `Min $${withdrawalSettings.minimumAmount} required`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Download className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-[#634141]/70">Total Withdrawn</p>
                  <p className="text-2xl font-bold text-[#634141]">
                    ${earnings.totalWithdrawn.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-md mb-8">
            <h2 className="text-xl font-semibold text-[#634141] mb-4">Quick Actions</h2>
            <div className="flex gap-4 flex-wrap">
              {canWithdraw ? (
                <button
                  onClick={() => setShowWithdrawalForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-[#634141] text-white rounded-lg hover:bg-[#634141]/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Withdraw Earnings
                </button>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Withdraw (${withdrawalSettings.minimumAmount} minimum)
                </button>
              )}
              
              <button
                onClick={() => setShowBankForm(true)}
                className="inline-flex items-center px-4 py-2 border border-[#634141] text-[#634141] rounded-lg hover:bg-[#634141]/10"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {paymentData.bankDetails?.accountNumber ? 'Update' : 'Add'} Bank Details
              </button>
            </div>
            
            {!paymentData.bankDetails?.accountNumber && (
              <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Add bank details to enable withdrawals.
              </div>
            )}
          </div>

          {/* Paper Submission Summary */}
          <div className="bg-white rounded-xl p-6 shadow-md mb-8">
            <h2 className="text-xl font-semibold text-[#634141] mb-4">
              Paper Submission Summary
            </h2>
            
            {!paymentData.paperRewards || paymentData.paperRewards.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-[#634141]/30 mx-auto mb-4" />
                <p className="text-[#634141]/70">No paper submissions found</p>
                <p className="text-[#634141]/50 text-sm mt-2">
                  Submit papers to start earning $1 per approval
                </p>
                <button
                  onClick={refreshData}
                  className="mt-4 px-4 py-2 bg-[#634141] text-white rounded-lg hover:bg-[#634141]/90"
                >
                  Refresh Data
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Approved Papers */}
                {approvedPapers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-green-600 mb-3">
                     Approved Papers ({approvedPapers.length})
                    </h3>
                    <div className="space-y-3">
                      {approvedPapers.map((paper) => (
                        <div key={paper.paperId} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-[#634141]">{paper.paperTitle}</h4>
                              <p className="text-sm text-[#634141]/70">
                                Submitted: {new Date(paper.submittedAt).toLocaleDateString()}
                              </p>
                              {paper.approvedAt && (
                                <p className="text-sm text-green-600">
                                  Approved: {new Date(paper.approvedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <span className="text-lg font-bold text-green-600">
                              +${paper.rewardAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Papers */}
                {pendingPapers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-yellow-600 mb-3">
                      ⏳ Pending Review ({pendingPapers.length})
                    </h3>
                    <div className="space-y-3">
                      {pendingPapers.map((paper) => (
                        <div key={paper.paperId} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-[#634141]">{paper.paperTitle}</h4>
                              <p className="text-sm text-[#634141]/70">
                                Submitted: {new Date(paper.submittedAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-yellow-600">
                                ⏳ Awaiting admin approval
                              </p>
                            </div>
                            <span className="text-lg font-medium text-yellow-600">
                              Pending $1.00
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejected Papers */}
                {rejectedPapers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-red-600 mb-3">
                      Rejected Papers ({rejectedPapers.length})
                    </h3>
                    <div className="space-y-3">
                      {rejectedPapers.map((paper) => (
                        <div key={paper.paperId} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-[#634141]">{paper.paperTitle}</h4>
                              <p className="text-sm text-[#634141]/70">
                                Submitted: {new Date(paper.submittedAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-red-600">
                                Not approved for reward
                              </p>
                            </div>
                            <span className="text-lg font-medium text-red-600">
                              $0.00
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Withdrawal History */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-[#634141] mb-4">Check Your Withdrawal History</h2>
            {!paymentData.withdrawals || paymentData.withdrawals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#634141]/70">No withdrawals yet</p>
                <p className="text-[#634141]/50 text-sm mt-2">
                  Minimum withdrawal amount: ${withdrawalSettings.minimumAmount}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentData.withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-4 border border-[#634141]/20 rounded-lg">
                    <div>
                      <p className="font-medium text-[#634141]">
                        ${withdrawal.amount.toFixed(2)} withdrawal
                      </p>
                      <p className="text-sm text-[#634141]/70">
                        Requested: {new Date(withdrawal.requestedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-[#634141]/70">
                        To: {withdrawal.bankDetails.bankName} ****{withdrawal.bankDetails.accountNumber.slice(-4)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {withdrawal.status === 'completed' ? 'Completed' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawalForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-[#634141] mb-4"> Withdraw Earnings</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#634141] mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="Enter amount"
                max={earnings.availableBalance}
                step="0.01"
                className="w-full px-3 py-2 border border-[#634141]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#634141]/20"
              />
              <p className="text-sm text-[#634141]/70 mt-1">
                Available: ${earnings.availableBalance.toFixed(2)} | 
                Minimum: ${withdrawalSettings.minimumAmount}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowWithdrawalForm(false)}
                className="flex-1 px-4 py-2 border border-[#634141] text-[#634141] rounded-lg hover:bg-[#634141]/10"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawalRequest}
                className="flex-1 px-4 py-2 bg-[#634141] text-white rounded-lg hover:bg-[#634141]/90"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Modal */}
      {showBankForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-[#634141] mb-4">Add Your Bank Details Here</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#634141] mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={bankDetails.accountHolderName}
                  onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                  className="w-full px-3 py-2 border border-[#634141]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#634141]/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#634141] mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                  className="w-full px-3 py-2 border border-[#634141]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#634141]/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#634141] mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-[#634141]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#634141]/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#634141] mb-2">
                  Routing Number
                </label>
                <input
                  type="text"
                  value={bankDetails.routingNumber}
                  onChange={(e) => setBankDetails({...bankDetails, routingNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-[#634141]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#634141]/20"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowBankForm(false)}
                className="flex-1 px-4 py-2 border border-[#634141] text-[#634141] rounded-lg hover:bg-[#634141]/10"
              >
                Cancel
              </button>
              <button
                onClick={handleBankDetailsUpdate}
                className="flex-1 px-4 py-2 bg-[#634141] text-white rounded-lg hover:bg-[#634141]/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}