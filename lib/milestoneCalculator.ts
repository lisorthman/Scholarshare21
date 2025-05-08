import { MilestoneProgress, MILESTONE_THRESHOLDS } from '@/types/milestone';

interface Paper {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  downloads: number;
}

export function calculateMilestones(papers: Paper[]): MilestoneProgress[] {
  const uploadCount = papers.length;
  const approvedCount = papers.filter(p => p.status === 'approved').length;
  const totalDownloads = papers.reduce((sum, p) => sum + (p.downloads || 0), 0);

  const milestones: MilestoneProgress[] = [];

  // Calculate Upload Milestones
  const uploadThreshold = MILESTONE_THRESHOLDS.UPLOADS.find(t => uploadCount < t.threshold) 
    || MILESTONE_THRESHOLDS.UPLOADS[MILESTONE_THRESHOLDS.UPLOADS.length - 1];
  const uploadRewards = MILESTONE_THRESHOLDS.UPLOADS
    .filter(t => uploadCount >= t.threshold)
    .map(t => t.reward);

  milestones.push({
    _id: 'uploads',
    title: 'Paper Uploads',
    description: `Upload research papers to earn badges (${uploadCount}/${uploadThreshold.threshold})`,
    currentCount: uploadCount,
    nextThreshold: uploadThreshold.threshold,
    progress: Math.min((uploadCount / uploadThreshold.threshold) * 100, 100),
    status: uploadCount >= uploadThreshold.threshold ? 'completed' : 'pending',
    achievedRewards: uploadRewards,
    date: new Date().toISOString()
  });

  // Calculate Approval Milestones
  const approvalThreshold = MILESTONE_THRESHOLDS.APPROVALS.find(t => approvedCount < t.threshold) 
    || MILESTONE_THRESHOLDS.APPROVALS[MILESTONE_THRESHOLDS.APPROVALS.length - 1];
  const approvalRewards = MILESTONE_THRESHOLDS.APPROVALS
    .filter(t => approvedCount >= t.threshold)
    .map(t => t.reward);

  milestones.push({
    _id: 'approvals',
    title: 'Paper Approvals',
    description: `Get papers approved (${approvedCount}/${approvalThreshold.threshold})`,
    currentCount: approvedCount,
    nextThreshold: approvalThreshold.threshold,
    progress: Math.min((approvedCount / approvalThreshold.threshold) * 100, 100),
    status: approvedCount >= approvalThreshold.threshold ? 'completed' : 'pending',
    achievedRewards: approvalRewards,
    date: new Date().toISOString()
  });

  // Calculate Download Milestones
  const downloadThreshold = MILESTONE_THRESHOLDS.DOWNLOADS.find(t => totalDownloads < t.threshold) 
    || MILESTONE_THRESHOLDS.DOWNLOADS[MILESTONE_THRESHOLDS.DOWNLOADS.length - 1];
  const downloadRewards = MILESTONE_THRESHOLDS.DOWNLOADS
    .filter(t => totalDownloads >= t.threshold)
    .map(t => t.reward);

  milestones.push({
    _id: 'downloads',
    title: 'Paper Downloads',
    description: `Total downloads (${totalDownloads}/${downloadThreshold.threshold})`,
    currentCount: totalDownloads,
    nextThreshold: downloadThreshold.threshold,
    progress: Math.min((totalDownloads / downloadThreshold.threshold) * 100, 100),
    status: totalDownloads >= downloadThreshold.threshold ? 'completed' : 'pending',
    achievedRewards: downloadRewards,
    date: new Date().toISOString()
  });

  return milestones;
}