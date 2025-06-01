import { getPaperById } from '@/lib/api/papers';
import RatingDisplay from '@/components/papers/RatingDisplay';
import ReviewList from '@/components/papers/ReviewList';
import ReviewForm from '@/components/papers/ReviewForm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default async function PaperDetailPage(props: { 
  params: { id: string },
  searchParams: any 
}) {
  const paperId = props.params.id;
  const paper = await getPaperById(paperId);

  if (!paper || paper.status !== 'approved') {
    notFound();
  }

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        {/* Back Button Added Here */}
        <Link href="/user-dashboard/papers" style={styles.backButton}>
          <FiArrowLeft size={18} />
          Back to Papers
        </Link>

        {/* Paper Title and Description */}
        <div style={styles.headerSection}>
          <h1 style={styles.title}>{paper.title}</h1>
          <p style={styles.abstract}>{paper.abstract}</p>
        </div>
        
        {/* Rating Display */}
        <div style={styles.ratingSection}>
          <h2 style={styles.sectionTitle}>Rating</h2>
          <RatingDisplay paperId={paper._id} />
        </div>
        
        {/* Reviews Section */}
        <div style={styles.reviewsSection}>
          <div style={styles.reviewsHeader}>
            <h2 style={styles.sectionTitle}>Reviews</h2>
          </div>
          <div style={styles.reviewsList}>
            <ReviewList paperId={paper._id} />
          </div>
        </div>
        
        {/* Review Form */}
        <div style={styles.reviewFormSection}>
          <h2 style={styles.sectionTitle}>Share Your Thoughts</h2>
          <div style={styles.formContainer}>
            <ReviewForm 
              paperId={paper._id} 
              submitButtonStyle={styles.submitButton}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#F9F5F0',
    minHeight: '100vh',
    padding: '48px 24px',
    fontFamily: '"Space Grotesk", sans-serif',
  },
  contentWrapper: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#FFF',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    padding: '40px',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    color: '#5D4037',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    ':hover': {
      color: '#3E2723',
    }
  },
  headerSection: {
    marginBottom: '48px',
    paddingBottom: '32px',
    borderBottom: '1px solid #EFEBE9',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#3E2723',
    marginBottom: '16px',
    lineHeight: '1.3',
  },
  abstract: {
    fontSize: '18px',
    color: '#5D4037',
    lineHeight: '1.6',
  },
  ratingSection: {
    marginBottom: '48px',
    padding: '32px',
    backgroundColor: '#EFEBE9',
    borderRadius: '12px',
  },
  reviewsSection: {
    marginBottom: '48px',
  },
  reviewsHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  reviewFormSection: {
    padding: '32px',
    backgroundColor: '#F5F0EB',
    borderRadius: '12px',
  },
  formContainer: {
    backgroundColor: '#FFF',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#3E2723',
    marginBottom: '20px',
  },
  submitButton: {
    backgroundColor: '#5D4037',
    color: '#FFF',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#3E2723',
      transform: 'translateY(-1px)',
    },
    ':active': {
      transform: 'translateY(0)',
    },
    ':disabled': {
      backgroundColor: '#BCAAA4',
      cursor: 'not-allowed',
    },
  },
};