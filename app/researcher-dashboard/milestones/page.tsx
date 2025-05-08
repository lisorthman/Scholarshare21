'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';
import { MilestoneProgress, MILESTONE_THRESHOLDS } from '@/types/milestone';

export default function MilestonePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [milestones, setMilestones] = useState<MilestoneProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/signin');
          return;
        }

        const authRes = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const userData = await authRes.json();
        if (!userData.valid) {
          throw new Error('Invalid authentication');
        }

        setUser(userData.user);

        const milestonesRes = await fetch(`/api/milestones?userId=${userData.user._id}`);
        if (!milestonesRes.ok) {
          throw new Error('Failed to fetch milestones');
        }

        const data = await milestonesRes.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid milestone data format');
        }

        setMilestones(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load milestones');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (!user) return null;

  const getMilestoneTheme = (type: string) => {
    switch (type) {
      case 'uploads':
        return {
          icon: '📄',
          headerBg: 'bg-blue-500',
          progress: 'bg-blue-500',
          badge: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'approvals':
        return {
          icon: '✅',
          headerBg: 'bg-green-500',
          progress: 'bg-green-500',
          badge: 'bg-green-50 text-green-700 border-green-200'
        };
      case 'downloads':
        return {
          icon: '⭐',
          headerBg: 'bg-violet-500',
          progress: 'bg-violet-500',
          badge: 'bg-violet-50 text-violet-700 border-violet-200'
        };
      default:
        return {
          icon: '🎯',
          headerBg: 'bg-gray-500',
          progress: 'bg-gray-500',
          badge: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };

  return (
    <DashboardLayout user={user} defaultPage="Milestones">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Research Milestones</h1>
            <p className="mt-2 text-sm text-gray-600">Track your research journey and unlock achievements</p>
          </div>

          {/* Content Section */}
          <div className="relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading milestones</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : milestones.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center">
                  <span className="text-6xl">🎯</span>
                  <h2 className="mt-4 text-xl font-medium text-gray-900">Start Your Journey</h2>
                  <p className="mt-2 text-gray-500">Upload your first paper to begin earning achievements</p>
                  <button 
                    onClick={() => router.push('/researcher-dashboard/uploads')}
                    className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Upload Paper
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {milestones.map((milestone) => {
                  const theme = getMilestoneTheme(milestone._id);
                  return (
                    <div
                      key={milestone._id}
                      className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden"
                    >
                      <div className={`${theme.headerBg} p-4 text-white`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{theme.icon}</span>
                          <h3 className="text-lg font-semibold">{milestone.title}</h3>
                        </div>
                        <p className="mt-2 text-sm text-white/90">{milestone.description}</p>
                      </div>

                      <div className="p-4 space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{milestone.currentCount} / {milestone.nextThreshold}</span>
                              <span className="text-xs text-gray-500">
                                ({Math.round(milestone.progress)}%)
                              </span>
                            </div>
                          </div>
                          <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`absolute top-0 left-0 h-full ${theme.progress} transition-all duration-700 ease-in-out`}
                              style={{ 
                                width: `${milestone.progress}%`,
                                boxShadow: milestone.progress > 0 ? '0 0 8px rgba(0,0,0,0.1)' : 'none'
                              }}
                            />
                            {milestone.progress >= 100 && (
                              <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {MILESTONE_THRESHOLDS[milestone._id.toUpperCase() as keyof typeof MILESTONE_THRESHOLDS]?.map((threshold) => (
                            <div 
                              key={threshold.level}
                              className={`p-3 rounded-md border ${
                                milestone.currentCount >= threshold.threshold 
                                  ? theme.badge
                                  : 'bg-gray-50 border-gray-200 opacity-60'
                              } transition-all duration-200`}
                            >
                              <div className="text-2xl text-center mb-1">{threshold.reward.split(' ')[0]}</div>
                              <div className="text-xs text-center font-medium">
                                {threshold.threshold}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}