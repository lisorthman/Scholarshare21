import { Paper } from '@/types';
import { UserIcon } from 'lucide-react';
import styles from './PaperCard.module.scss';

const CATEGORY_EMOJIS: Record<string, string> = {
  'computer-science': '💻',
  'biology': '🧬',
  'physics': '⚛️',
  'chemistry': '🧪',
  'engineering': '⚙️',
  'mathematics': '🧮',
  'medicine': '🏥',
  'social-sciences': '🌐',
  'statistics': '📊',
  'geology': '🌍',
  'psychology': '🧠',
  'database': '🗄️',
  'sports': '🏅',
  'dance': '🩰',
  'zoology': '🦓',
  'media': '🎥',
  'artificial-intelligence': '🤖',
  'test': '🧪',
  'default': '📄'
};

export const PaperCard = ({ paper }: { paper: Paper }) => {
  const formattedDate = paper.createdAt 
    ? new Date(paper.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

  const categoryKey = paper.category
    ? paper.category.toLowerCase().replace(/\s+/g, '-')
    : 'default';
  const emoji = CATEGORY_EMOJIS[categoryKey] || CATEGORY_EMOJIS.default;

  return (
    <div className={styles.paperCard}>
      <h3 className={styles.title}>{paper.title}</h3>
      
      <div className={styles.metaRow}>
        <span className={styles.category}>
          {emoji} {paper.category || 'Uncategorized'}
        </span>
        {formattedDate && (
          <span className={styles.date}>
            📅 {formattedDate}
          </span>
        )}
      </div>

      {paper.abstract && (
        <p className={styles.abstract}>
          {paper.abstract}
        </p>
      )}

      <div className={styles.author}>
        <UserIcon />
        <span>{paper.author}</span>
      </div>

      {paper.keywords?.length > 0 && (
        <div className={styles.keywords}>
          {paper.keywords.slice(0, 3).map((keyword, i) => (
            <span key={i} className={styles.keyword}>
              {keyword}
            </span>
          ))}
          {paper.keywords.length > 3 && (
            <span className={styles.keyword}>+{paper.keywords.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default PaperCard;