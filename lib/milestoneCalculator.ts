// lib/milestoneCalculator.ts
import MilestoneConfig from '@/models/MilestoneConfig';
import User from '@/models/user';
import { MilestoneProgress } from '@/types/milestone';
import { seedMilestoneConfig } from './seedMilestoneConfig';

interface UserWithCounts {
  _id: string;
  counts: {
    uploads: number;
    approvals: number;
    downloads: number;
  };
  badges: string[];
}

interface MilestoneConfigDocument {
  UPLOADS: Array<{
    level: number;
    threshold: number;
    reward: string;
  }>;
  APPROVALS: Array<{
    level: number;
    threshold: number;
    reward: string;
  }>;
  DOWNLOADS: Array<{
    level: number;
    threshold: number;
    reward: string;
  }>;
}

interface CalculateAndSyncResult {
  milestones: MilestoneProgress[];
  newBadges: string[];
  userCounts: UserWithCounts['counts'];
}

export async function calculateAndSyncMilestones(
  userId: string
): Promise<CalculateAndSyncResult> {
  try {
    console.log(`[Milestone] Starting calculation for user ${userId}`);
    
    // Ensure milestone thresholds exist
    await seedMilestoneConfig();
    console.log('[Milestone] Config seeded/verified');

    const [user, config] = await Promise.all([
      User.findById(userId)
        .select('counts badges')
        .lean<UserWithCounts>()
        .exec(),
      MilestoneConfig.findOne()
        .lean<MilestoneConfigDocument>()
        .exec()
    ]);

    console.log('[Milestone] Fetched data:', {
      userExists: !!user,
      configExists: !!config,
      userCounts: user?.counts
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (!config) {
      throw new Error('Milestone thresholds not configured');
    }

    // Initialize counts if they don't exist
    const counts = {
      uploads: user.counts?.uploads || 0,
      approvals: user.counts?.approvals || 0,
      downloads: user.counts?.downloads || 0
    };

    console.log('[Milestone] Current counts:', counts);

    // Sort thresholds from lowest to highest
    const sortedUploads = [...config.UPLOADS].sort((a, b) => a.threshold - b.threshold);
    const sortedApprovals = [...config.APPROVALS].sort((a, b) => a.threshold - b.threshold);
    const sortedDownloads = [...config.DOWNLOADS].sort((a, b) => a.threshold - b.threshold);

    // Calculate achieved rewards
    const getAchievedRewards = (
      thresholds: typeof sortedUploads,
      count: number
    ): string[] => {
      return thresholds
        .filter(t => count >= t.threshold)
        .map(t => t.reward);
    };

    const allRewards = [
      ...getAchievedRewards(sortedUploads, counts.uploads),
      ...getAchievedRewards(sortedApprovals, counts.approvals),
      ...getAchievedRewards(sortedDownloads, counts.downloads)
    ];

    // Sync new badges
    const newBadges = allRewards.filter(reward => 
      !user.badges?.includes(reward)
    );

    if (newBadges.length > 0) {
      console.log('[Milestone] New badges to add:', newBadges);
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { badges: { $each: newBadges } } },
        { new: true }
      ).exec();
    }

    // Calculate progress for each milestone type
    const calculateProgress = (
      id: string,
      title: string,
      count: number,
      thresholds: typeof sortedUploads
    ): MilestoneProgress => {
      const nextThreshold = thresholds.find(t => count < t.threshold)?.threshold || 
        thresholds[thresholds.length - 1].threshold;

      return {
        _id: id,
        title,
        description: `${title} (${count}/${nextThreshold})`,
        currentCount: count,
        nextThreshold,
        progress: Math.min((count / nextThreshold) * 100, 100),
        status: count >= nextThreshold ? 'completed' : 'pending',
        achievedRewards: thresholds
          .filter(t => count >= t.threshold)
          .map(t => t.reward),
        date: new Date().toISOString()
      };
    };

    const milestones: MilestoneProgress[] = [
      calculateProgress('uploads', 'Paper Uploads', counts.uploads, sortedUploads),
      calculateProgress('approvals', 'Paper Approvals', counts.approvals, sortedApprovals),
      calculateProgress('downloads', 'Paper Downloads', counts.downloads, sortedDownloads)
    ];

    console.log('[Milestone] Calculated milestones:', milestones);

    return {
      milestones,
      newBadges,
      userCounts: counts
    };

  } catch (error) {
    console.error('[Milestone] Error in calculateAndSyncMilestones:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to calculate milestones'
    );
  }
}