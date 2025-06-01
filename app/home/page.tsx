// app/home/page.tsx
import { getAllPapers, getCategories } from '@/lib/api';
import PaperCarousel from '@/components/PaperCarousel';
import styles from './HomePage.module.scss';

export default async function HomePage() {
  const papers = await getAllPapers();
  const categories = await getCategories();

  const popularPapers = papers
    .slice()
    .sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
    .slice(0, 10);

  const recentPapers = papers
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className={styles.homePage}>
      <PaperCarousel
        title="Most Popular"
        papers={popularPapers}
        variant="popular"
      />

      <PaperCarousel
        title="Recently Added"
        papers={recentPapers}
        variant="recent"
      />

      {categories.map((category) => {
        const categoryPapers = papers.filter(
          (paper) => paper.category.toLowerCase() === category.toLowerCase()
        );
        if (categoryPapers.length === 0) return null;

        return (
          <PaperCarousel
            key={category}
            title={category}
            papers={categoryPapers}
            variant="category"
          />
        );
      })}
    </div>
  );
}
