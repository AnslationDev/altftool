import ArticleCard from './ArticleCard';
import { articlesData } from '../data';

const FeaturedSection = ({ category }) => {
  const featuredPool = articlesData.filter((article) => article.showInFeatured !== false);

  let filteredArticles = featuredPool.filter((article) => article.category === category);

  if (filteredArticles.length === 0) {
    filteredArticles = featuredPool.slice(0, 3);
  } else if (filteredArticles.length < 3) {
    const others = featuredPool.filter((a) => a.category !== category);
    filteredArticles = [...filteredArticles, ...others].slice(0, 3);
  } else {
    filteredArticles = filteredArticles.slice(0, 3);
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {filteredArticles.map((article) => (
        <ArticleCard
          key={article.id}
          id={article.id}
          image={article.image}
          title={article.title}
          author={article.author}
          plays={article.plays}
        />
      ))}
    </div>
  );
};

export default FeaturedSection;
