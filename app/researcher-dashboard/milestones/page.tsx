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

  const getMilestoneConfig = (type: string) => {
    const configs = {
      uploads: {
        icon: <UploadCloud className="w-5 h-5" />,
        colors: {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          progress: 'bg-blue-500',
          border: 'border-blue-200'
        }
      },
      approvals: {
        icon: <CheckCircle className="w-5 h-5" />,
        colors: {
          bg: 'bg-green-100',
          text: 'text-green-800',
          progress: 'bg-green-500',
          border: 'border-green-200'
        }
      },
      downloads: {
        icon: <Download className="w-5 h-5" />,
        colors: {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          progress: 'bg-purple-500',
          border: 'border-purple-200'
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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Research Milestones</h1>
          <p className="text-muted-foreground">
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {milestones.map((milestone) => {
              const config = getMilestoneConfig(milestone._id);
              const isComplete = milestone.status === 'completed';

              return (
                <div
                  key={milestone._id}
                  className={`rounded-xl border ${config.colors.border} overflow-hidden transition-all hover:shadow-md`}
                >
                  <div className={`p-6 ${config.colors.bg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.colors.bg} ${config.colors.text}`}>
                        {config.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {milestone.currentCount}/{milestone.nextThreshold}
                        </span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full ${config.colors.progress} transition-all duration-500 ease-out`}
                          style={{ width: `${milestone.progress}%` }}
                        />
                        {isComplete && (
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Achievements
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {milestone.achievedRewards.map((reward) => (
                          <div
                            key={reward}
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.colors.bg} ${config.colors.text} border ${config.colors.border}`}
                          >
                            <BadgeCheck className="mr-1 h-3 w-3" />
                            {reward}
                          </div>
                        ))}
                        {milestone.achievedRewards.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No achievements yet
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Next Reward */}
                    {!isComplete && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Next reward at {milestone.nextThreshold} {milestone._id}
                        </p>
                      </div>
                    )}
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