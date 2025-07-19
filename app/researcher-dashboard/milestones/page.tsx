'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';
import { MilestoneProgress } from '@/types/milestone';
import { BadgeCheck, UploadCloud, CheckCircle, Trophy, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

export default function MilestonePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [milestones, setMilestones] = useState<MilestoneProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paperDownloads, setPaperDownloads] = useState<{paperId: string, title: string, count: number}[]>([]);
  const [refreshingDownloads, setRefreshingDownloads] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/signin');
          return;
        }

        // Verify token
        const authRes = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!authRes.ok) {
          const errorData = await authRes.json();
          throw new Error(errorData.error || 'Authentication failed');
        }
        
        const authData = await authRes.json();
        setUser(authData.user);

        // Fetch milestones - now including downloads
        const userId = authData.user._id || authData.user.id;
        const milestonesRes = await fetch(`/api/milestones?userId=${userId}`);
        
        if (!milestonesRes.ok) {
          const errorData = await milestonesRes.json();
          throw new Error(errorData.error || 'Failed to fetch milestones');
        }
        
        const apiResponse = await milestonesRes.json();
        
        if (!apiResponse.success || !Array.isArray(apiResponse.data?.milestones)) {
          throw new Error('Invalid data format received from server');
        }
        
        // Include all milestones (uploads, approvals, downloads)
        setMilestones(apiResponse.data.milestones);
        
        // Get detailed paper download counts
        if (apiResponse.data.paperDownloads) {
          setPaperDownloads(apiResponse.data.paperDownloads);
        } else {
          await fetchPaperDownloads(userId);
        }

        // Show notifications for new badges
        if (apiResponse.data.newBadges?.length > 0) {
          apiResponse.data.newBadges.forEach((badge: string) => {
            toast.success(
              <div className="flex items-center gap-2">
                <BadgeCheck className="text-green-500" />
                <span>New achievement: <strong>{badge}</strong></span>
              </div>,
              { autoClose: 5000 }
            );
          });
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        toast.error('Failed to load milestones');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const fetchPaperDownloads = async (userId: string) => {
    try {
      const res = await fetch(`/api/papers/downloads?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setPaperDownloads(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching paper downloads:", error);
    }
  };

  const refreshMilestones = async () => {
    try {
      setIsLoading(true);
      const userId = user?._id || user?.id;
      const res = await fetch(`/api/milestones?userId=${userId}&forceRefresh=true`);
      const data = await res.json();
      
      if (data.success) {
        setMilestones(data.data.milestones);
        if (data.data.paperDownloads) {
          setPaperDownloads(data.data.paperDownloads);
        }
        toast.success("Download statistics updated successfully!");
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error("Failed to refresh download statistics");
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshDownloadsOnly = async () => {
    try {
      setRefreshingDownloads(true);
      const userId = user?._id || user?.id;
      await fetchPaperDownloads(userId || '');
      const res = await fetch(`/api/milestones?userId=${userId}&downloadsOnly=true`);
      const data = await res.json();
      
      if (data.success) {
        // Update only the downloads milestone
        setMilestones(prevMilestones => 
          prevMilestones.map(milestone => 
            milestone._id === 'downloads' ? data.data.downloadMilestone : milestone
          )
        );
        toast.success("Download statistics updated successfully!");
      }
    } catch (error) {
      console.error('Download refresh failed:', error);
      toast.error("Failed to refresh download statistics");
    } finally {
      setRefreshingDownloads(false);
    }
  };

  // Updated: Replace blue, green, purple with #6D4C4C brown
  const getMilestoneConfig = (type: string) => {
    const configs = {
      uploads: {
        icon: <UploadCloud className="w-6 h-6" />,
        title: 'Paper Uploads',
        description: 'Submit your own research papers to the platform',
        colors: {
          bg: 'rgba(109, 76, 76, 0.1)',
          text: '#6D4C4C',
          progress: '#6D4C4C',
          border: 'rgba(73, 50, 50, 0.2)',
          card: 'rgba(109, 76, 76, 0.05)'
        }
      },
      approvals: {
        icon: <CheckCircle className="w-6 h-6" />,
        title: 'Approved Papers',
        description: 'Get your research papers approved by Admin',
        colors: {
          bg: 'rgba(109, 76, 76, 0.1)',
          text: '#6D4C4C',
          progress: '#6D4C4C',
          border: 'rgba(109, 76, 76, 0.2)',
          card: 'rgba(109, 76, 76, 0.05)'
        }
      },
      downloads: {
        icon: <Download className="w-6 h-6" />,
        title: 'Paper Downloads',
        description: 'Track downloads of your approved research papers',
        colors: {
          bg: 'rgba(109, 76, 76, 0.1)',
          text: '#6D4C4C',
          progress: '#6D4C4C',
          border: 'rgba(109, 76, 76, 0.2)',
          card: 'rgba(109, 76, 76, 0.05)'
        }
      }
    };

    return configs[type as keyof typeof configs] || {
      icon: <BadgeCheck className="w-6 h-6" />,
      title: 'Achievement',
      description: 'Complete research milestones',
      colors: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        progress: 'bg-gray-600',
        border: 'border-gray-200'
      }
    };
  };

  if (!user) return null;

  return (
    <DashboardLayout user={user} defaultPage="Milestone">
      <div className="space-y-6">
        {/* Header - Clean and minimal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Research Milestones</h1>
          <p className="text-gray-600">
            Track your research achievements!
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: '#6D4C4C' }} />
              <p className="text-gray-600">Loading your milestones...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border border-red-200 p-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading milestones</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-amber-900 hover:bg-amber-950 text-white"
                  style={{ backgroundColor: '#6D4C4C', borderColor: '#6D4C4C' }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        ) : milestones.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Trophy className="h-16 w-16 text-gray-400" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No milestones yet</h3>
                <p className="text-gray-600 mb-6">
                  Start your research journey by uploading your first paper
                </p>
                <Button
                  onClick={() => router.push('/researcher-dashboard/uploads')}
                  className="bg-amber-700 hover:bg-amber-800 text-white"
                  style={{ backgroundColor: '#6D4C4C', borderColor: '#6D4C4C' }}
                >
                  Upload Your First Paper
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {milestones.map((milestone) => {
                const config = getMilestoneConfig(milestone._id);
                const progressPercentage = Math.min((milestone.currentCount / milestone.nextThreshold) * 100, 100);

                return (
                  <div
                    key={milestone._id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Header - Updated to use custom brown for specific milestones */}
                    <div 
                      className="p-6 border-b border-gray-200"
                      style={{ backgroundColor: config.colors.bg }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-white shadow-sm">
                          <div style={{ color: config.colors.text }}>
                            {config.icon}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {config.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {config.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                      {/* Progress Section */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {milestone.currentCount} / {milestone.nextThreshold}
                          </span>
                        </div>
                        <div 
                          className="w-full rounded-full h-3 overflow-hidden"
                          style={{ backgroundColor: config.colors.bg }}
                        >
                          <div
                            className="h-full transition-all duration-500 ease-out rounded-full"
                            style={{ 
                              width: `${progressPercentage}%`,
                              backgroundColor: typeof config.colors.progress === 'string' && config.colors.progress.startsWith('#') 
                                ? config.colors.progress 
                                : undefined
                            }}
                          />
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {progressPercentage.toFixed(1)}% complete
                        </div>
                      </div>

                      {/* Achievements Section */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Earned Achievements
                        </h4>
                        {milestone.achievedRewards.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {milestone.achievedRewards.map((reward, index) => (
                              <div
                                key={index}
                                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border"
                                style={{ 
                                  backgroundColor: config.colors.bg,
                                  color: config.colors.text,
                                  borderColor: config.colors.border
                                }}
                              >
                                <BadgeCheck className="w-3 h-3 mr-1.5" />
                                {reward}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 italic">
                            No achievements yet. Keep working towards your goals!
                          </div>
                        )}
                      </div>

                      {/* Next Goal */}
                      {milestone.currentCount < milestone.nextThreshold && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center space-x-2">
                            <Trophy className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Next Goal
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {milestone.nextThreshold - milestone.currentCount} more to reach your next milestone!
                          </p>
                        </div>
                      )}

                      {/* Special message for downloads - Now with refresh button */}
                      {milestone._id === 'downloads' && (
                        <div 
                          className="border rounded-lg p-3"
                          style={{ 
                            backgroundColor: config.colors.bg,
                            borderColor: config.colors.border
                          }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs" style={{ color: config.colors.text }}>
                              💡 Downloads are counted when users download your approved papers
                            </p>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={refreshDownloadsOnly}
                              disabled={refreshingDownloads}
                              className="h-7 text-xs border hover:bg-gray-50"
                              style={{ borderColor: '#6D4C4C', color: '#6D4C4C' }}
                            >
                              {refreshingDownloads ? (
                                <span className="flex items-center">
                                  <div className="animate-spin h-3 w-3 border-t-2 border-b-2 rounded-full mr-2" style={{ borderColor: '#6D4C4C' }} />
                                  Updating
                                </span>
                              ) : 'Refresh Downloads'}
                            </Button>
                          </div>
                          
                          {/* Paper download breakdown - New section */}
                          {milestone._id === 'downloads' && paperDownloads.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <p className="text-xs font-medium mb-1" style={{ color: config.colors.text }}>
                                Download breakdown:
                              </p>
                              <div className="max-h-40 overflow-y-auto">
                                {paperDownloads.map((paper, idx) => (
                                  <div key={idx} className="flex justify-between text-xs py-1">
                                    <span className="truncate max-w-[70%]" title={paper.title}>
                                      {paper.title}
                                    </span>
                                    <span className="font-medium">{paper.count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Milestone Summary - Simplified */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {milestones.map((milestone) => {
                  const config = getMilestoneConfig(milestone._id);
                  return (
                    <div key={milestone._id} className="text-center">
                      <div 
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2"
                        style={{ backgroundColor: config.colors.bg }}
                      >
                        <div style={{ color: config.colors.text }}>
                          {config.icon}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{milestone.currentCount}</div>
                      <div className="text-sm text-gray-600">{config.title}</div>
                      <div className="text-xs text-gray-500">
                        {milestone.achievedRewards.length} badge{milestone.achievedRewards.length !== 1 ? 's' : ''} earned
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Continue Your Research Journey
                  </h3>
                  <p className="text-gray-600">
                    Upload more papers to advance your milestones and earn new achievements
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={refreshMilestones}
                    className="bg-white hover:bg-gray-100 text-amber-800 border flex items-center"
                    style={{ borderColor: '#6D4C4C', color: '#6D4C4C' }}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <div className="animate-spin h-3 w-3 border-t-2 border-b-2 rounded-full mr-2" style={{ borderColor: '#6D4C4C' }} />
                        Updating...
                      </span>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Update Stats
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => router.push('/researcher-dashboard/uploads')}
                    className="bg-amber-700 hover:bg-amber-800 text-white border-none"
                    style={{ backgroundColor: '#6D4C4C', borderColor: '#6D4C4C' }}
                  >
                    Upload Paper
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}