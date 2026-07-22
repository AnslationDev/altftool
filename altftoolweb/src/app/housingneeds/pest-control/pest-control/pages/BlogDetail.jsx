import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '../data/blog';
import { ArrowLeft } from 'lucide-react';
import CTASection from '../components/CTASection';

const BlogDetail = () => {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug) || blogPosts[0];
  const related = blogPosts.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <div>
      <div className="max-w-[1280px] mx-auto px-6 pt-10">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-[#1D7A43] font-medium mb-6"><ArrowLeft size={16} /> Back to Blog</Link>

        <div className="max-w-3xl">
          <div className="uppercase text-xs tracking-[2px] font-semibold text-[#1D7A43]">{post.category} • {post.readTime}</div>
          <h1 className="text-[44px] leading-none tracking-[-2px] font-bold mt-3 mb-6">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm pb-7 border-b">
            <div><span className="font-semibold">{post.author}</span> — {post.authorTitle}</div>
            <div className="text-[#64748b]">{post.date}</div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6">
        <img src={post.image} alt={post.title} className="w-full max-h-[460px] object-cover rounded-3xl my-8" />

        <div className="max-w-3xl mx-auto prose prose-lg text-[#374151]">
          {post.content.split('\n\n').map((para, index) => (
            <p key={index} className="mb-6 leading-relaxed">{para}</p>
          ))}
        </div>

        {/* Related */}
        <div className="max-w-3xl mx-auto mt-16 border-t pt-10">
          <h3 className="font-semibold text-xl mb-6">Continue Reading</h3>
          <div className="grid md:grid-cols-3 gap-5">
            {related.map(r => (
              <Link key={r.id} to={`/blog/${r.slug}`} className="card p-5 block group">
                <div className="text-xs text-[#1D7A43] font-semibold">{r.category}</div>
                <div className="font-semibold group-hover:text-[#1D7A43] mt-2 mb-2 leading-tight">{r.title}</div>
                <div className="text-xs text-[#64748b]">{r.date}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-20">
        <CTASection />
      </div>
    </div>
  );
};

export default BlogDetail;
