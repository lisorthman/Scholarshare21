export interface MilestoneThreshold {
    level: number;
    threshold: number;
    reward: string;
  }
  
  export interface MilestoneProgress {
    _id: string;
    title: string;
    description: string;
    currentCount: number;
    nextThreshold: number;
    progress: number;
    status: 'pending' | 'completed';
    achievedRewards: string[];
    date: string;
  }
  
  export const MILESTONE_THRESHOLDS = {
    UPLOADS: [
      { level: 1, threshold: 5, reward: '🥉 Bronze Uploader' },
      { level: 2, threshold: 10, reward: '🥈 Silver Uploader' },
      { level: 3, threshold: 20, reward: '🏆 Gold Uploader' }
    ],
    APPROVALS: [
      { level: 1, threshold: 3, reward: '🥉 Bronze Researcher' },
      { level: 2, threshold: 8, reward: '🥈 Silver Researcher' },
      { level: 3, threshold: 15, reward: '🏆 Gold Researcher' }
    ],
    DOWNLOADS: [
      { level: 1, threshold: 50, reward: '🥉 Bronze Impact' },
      { level: 2, threshold: 200, reward: '🥈 Silver Impact' },
      { level: 3, threshold: 500, reward: '🏆 Gold Impact' }
    ]
  } as const;