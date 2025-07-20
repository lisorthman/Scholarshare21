import { getApprovedPapers } from '@/lib/api/papers';
import PaperCard from '@/components/papers/PaperCard';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';

export default async function UserPapersPage() {
  const papers = await getApprovedPapers();
  
  // Convert papers to plain objects and ensure _id is string
  const plainPapers = papers.map(paper => ({
    ...paper,
    _id: paper._id.toString() // Convert ObjectId to string
  }));

  // Mock user data - replace with your actual user fetching logic
  const user: User = {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  };

  return (
    <DashboardLayout user={user} defaultPage="Papers">
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Research Papers</h1>
        </div>

        {plainPapers.length > 0 ? (
          <div style={styles.gridContainer}>
            {plainPapers.map((paper) => (
              <div key={paper._id} style={styles.paperContainer}>
                <div style={styles.paperHeader}>
                  <span style={styles.paperDate}>
                    {new Date(paper.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  {paper.author && (
                    <span style={styles.paperAuthor}>
                      by {paper.author.name}
                    </span>
                  )}
                </div>
                
                <PaperCard
                  paper={{
                    ...(paper as any),
                    category: (paper as any).category || paper.categoryId?.name || 'Uncategorized',
                    fileUrl: (paper as any).fileUrl || '',
                    createdAt: new Date(paper.createdAt),
                    updatedAt: new Date(paper.updatedAt),
                  }}
                />
                
                <div style={styles.footer}>
                  <a
                    href={`/user-dashboard/papers/${paper._id}`}
                    style={styles.viewLink}
                  >
                    View Rating and Reviews →
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No papers available yet</h3>
            <p style={styles.emptyText}>Check back later for new research papers</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    margin: '24px auto',
    maxWidth: '1300px',
    width: '100%',
    backgroundColor: '#F8F5ED',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    fontFamily: '"Space Grotesk", sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    borderBottom: '1px solid #E0D8C3',
    paddingBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#5C4D3D',
    margin: '0',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
  },
  paperContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    border: '1px solid #E0D8C3',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#FFFDF9',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
  },
  paperHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    color: '#8C7C68',
    marginBottom: '8px',
  },
  paperDate: {
    fontWeight: '500',
  },
  paperAuthor: {
    fontStyle: 'italic',
  },
  viewLink: {
    color: '#8C6A3D',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: 'rgba(140, 106, 61, 0.1)',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '12px',
    borderTop: '1px dashed #E0D8C3',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    border: '1px dashed #E0D8C3',
    borderRadius: '12px',
    backgroundColor: '#F5F0E6',
    marginTop: '24px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#5C4D3D',
    margin: '0 0 12px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#8C7C68',
    margin: '0 0 24px',
    textAlign: 'center',
  },
};