'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';
import { MilestoneProgress } from '@/types/milestone';
import { BadgeCheck, UploadCloud, CheckCircle, Download, Trophy, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';

export default function MilestonePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [milestones, setMilestones] = useState<MilestoneProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Fetch milestones - updated to match API response structure
        const milestonesRes = await fetch(`/api/milestones?userId=${authData.user._id}`);
        
        if (!milestonesRes.ok) {
          const errorData = await milestonesRes.json();
          throw new Error(errorData.error || 'Failed to fetch milestones');
        }
        
        const apiResponse = await milestonesRes.json();
        
        // Updated validation to match the API response structure
        if (!apiResponse.success || !Array.isArray(apiResponse.data?.milestones)) {
          throw new Error('Invalid data format received from server');
        }
        
        setMilestones(apiResponse.data.milestones);

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

  // In your milestones page component
const fetchMilestones = async (userId: string) => {
  try {
    const response = await fetch(`/api/milestones?userId=${userId}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch milestones');
    }

    if (!Array.isArray(result.data?.milestones)) {
      throw new Error('Invalid milestones data format');
    }

    return result.data;
  } catch (error) {
    console.error('Fetch milestones error:', error);
    throw error;
  }
};

const handleApprove = async (paperId: string) => {
  try {
    const response = await fetch(`/api/paper/${paperId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' })
    });
    
    const result = await response.json();
    
    if (result.success) {
      toast.success('Paper approved!');
      if (result.shouldRefreshMilestones) {
        refreshMilestones(); // Your refresh function
      }
    } else {
      toast.error(result.error || 'Approval failed');
    }
  } catch (error) {
    toast.error('Error approving paper');
  }
};

// Update your useEffect hook
useEffect(() => {
  const loadData = async () => {
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

      if (!authRes.ok) throw new Error('Authentication failed');
      
      const authData = await authRes.json();
      setUser(authData.user);

      // Fetch milestones
      const { milestones, newBadges } = await fetchMilestones(authData.user._id);
      setMilestones(milestones);

      // Handle new badges
      if (newBadges?.length > 0) {
        newBadges.forEach((badge: any) => {
          toast.success(`New achievement: ${badge}`);
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
}, [router]);

const refreshMilestones = async () => {
  try {
    setIsLoading(true);
    const res = await fetch(`/api/milestones?userId=${user?._id}`);
    const data = await res.json();
    
    if (data.success) {
      setMilestones(data.data.milestones);
    }
  } catch (error) {
    console.error('Refresh failed:', error);
  } finally {
    setIsLoading(false);
  }
};

  // Update the getMilestoneConfig function with new colors
  const getMilestoneConfig = (type: string) => {
    const configs = {
      uploads: {
        icon: <UploadCloud className="w-7 h-7" />,
        colors: {
          bg: 'bg-[#E0D8C3]/30',
          text: 'text-[#634141]',
          progress: 'bg-[#634141]',
          border: 'border-[#E0D8C3]'
        }
      },
      approvals: {
        icon: <CheckCircle className="w-7 h-7" />,
        colors: {
          bg: 'bg-[#E0D8C3]/30',
          text: 'text-[#634141]',
          progress: 'bg-[#634141]',
          border: 'border-[#E0D8C3]'
        }
      },
      downloads: {
        icon: <Download className="w-7 h-7" />,
        colors: {
          bg: 'bg-[#E0D8C3]/30',
          text: 'text-[#634141]',
          progress: 'bg-[#634141]',
          border: 'border-[#E0D8C3]'
        }
      }
    };

    return configs[type as keyof typeof configs] || {
      icon: <BadgeCheck className="w-5 h-5" />,
      colors: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        progress: 'bg-gray-500',
        border: 'border-gray-200'
      }
    };
  };

  if (!user) return null;

  return (
    <DashboardLayout user={user} activeTab="milestones">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#634141]">Research Milestones</h1>
          <p className="text-[#634141]/70">
            Track your research achievements and progress
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
            <div className="text-destructive mb-2">
              <AlertCircle className="mx-auto h-8 w-8" />
            </div>
            <h3 className="font-medium">Error loading milestones</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : milestones.length === 0 ? (
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No milestones yet</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Start by uploading your first research paper
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push('/researcher-dashboard/uploads')}
            >
              Upload Paper
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            {milestones.map((milestone) => {
              const config = getMilestoneConfig(milestone._id);
              const isComplete = milestone.status === 'completed';

              return (
                <div
                  key={milestone._id}
                  className={`rounded-2xl border-2 ${config.colors.border} overflow-hidden transition-all duration-300 hover:shadow-xl bg-white/50`}
                >
                  {/* Header section */}
                  <div className={`p-8 ${config.colors.bg} backdrop-blur-sm`}>
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-xl ${config.colors.bg} ${config.colors.text} ring-1 ring-[#634141]/20`}>
                        <div className="w-10 h-10">
                          {config.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-[#634141] mb-2">{milestone.title}</h3>
                        <p className="text-base text-[#634141]/70">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content section */}
                  <div className="p-8 space-y-8">
                    {/* Progress Bar - larger */}
                    <div>
                      <div className="flex justify-between text-base mb-4">
                        <span className="text-[#634141]/70">Progress</span>
                        <span className="font-medium text-[#634141]">
                          {milestone.currentCount}/{milestone.nextThreshold}
                        </span>
                      </div>
                      <div className="relative h-4 w-full overflow-hidden rounded-full bg-[#E0D8C3]/30">
                        <div
                          className={`h-full ${config.colors.progress} transition-all duration-500 ease-out rounded-full`}
                          style={{ width: `${milestone.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Achievements section - larger badges */}
                    <div className="space-y-4">
                      <h4 className="text-base font-medium text-[#634141]/70">
                        Achievements
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {milestone.achievedRewards.map((reward) => (
                          <div
                            key={reward}
                            className={`inline-flex items-center rounded-full px-5 py-2.5 text-base font-medium ${config.colors.bg} ${config.colors.text} border ${config.colors.border} shadow-sm`}
                          >
                            <BadgeCheck className="mr-2 h-5 w-5" />
                            {reward}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}