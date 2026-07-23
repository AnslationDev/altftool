import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts, blogCategories } from '../data/blog';
import { Search } from 'lucide-react';

const Blog = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 6;

  const filtered = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || post.category === category;
    return matchesSearch && matchesCat;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const currentPosts = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <div className="bg-[#14532D] py-16 text-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <h1 className="text-white text-6xl tracking-[-2.2px] font-bold">Pest Control Insights</h1>
          <p className="text-xl text-white/70 mt-3 max-w-lg">Expert advice, seasonal guides, and the latest from South Florida pest professionals.</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 pt-10 pb-20">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-9">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-4 text-[#64748b]" />
            <input value={search} onChange={e => {setSearch(e.target.value); setPage(1);}} placeholder="Search articles..." className="input pl-11" />
          </div>
          <div className="flex flex-wrap gap-2">
            {blogCategories.map(cat => (
              <button key={cat} onClick={() => {setCategory(cat); setPage(1);}} className={`px-5 py-[9px] rounded-2xl text-sm font-medium border transition ${category === cat ? 'bg-[#1D7A43] text-white border-[#1D7A43]' : 'border-[#E5E7EB] hover:bg-[#F8FAFC]'}`}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Featured */}
        {page === 1 && filtered.length > 0 && (
          <Link to={`/blog/${filtered[0].slug}`} className="block mb-8 group">
            <div className="grid md:grid-cols-5 gap-6 bg-[#F8FAFC] rounded-3xl overflow-hidden">
              <div className="md:col-span-3">
                <img src={filtered[0].image} alt="" className="w-full h-full object-cover md:h-[340px]" />
              </div>
              <div className="md:col-span-2 p-8 md:pr-10 flex flex-col justify-center">
                <div className="uppercase tracking-widest text-xs text-[#1D7A43] font-bold">{filtered[0].category} • {filtered[0].readTime}</div>
                <h2 className="font-bold text-[27px] tracking-[-0.7px] leading-tight mt-2 mb-3 group-hover:text-[#1D7A43] transition">{filtered[0].title}</h2>
                <p className="text-[#374151] mb-auto">{filtered[0].excerpt}</p>
                <div className="text-sm mt-6 font-medium text-[#1D7A43]">Read full article →</div>
              </div>
            </div>
          </Link>
        )}

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPosts.slice(page === 1 ? 1 : 0).map(post => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="blog-card group block card overflow-hidden">
              <img src={post.image} className="w-full h-48 object-cover" alt={post.title} />
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#1D7A43] mb-2">{post.category} • {post.readTime}</div>
                <h3 className="font-bold text-xl leading-tight tracking-tight mb-3 group-hover:text-[#1D7A43]">{post.title}</h3>
                <p className="text-sm text-[#374151] line-clamp-3 mb-5">{post.excerpt}</p>
                <div className="text-xs flex justify-between items-center pt-3 border-t text-[#64748b]">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-xl text-sm font-semibold ${page === i + 1 ? 'bg-[#1D7A43] text-white' : 'border hover:bg-[#F8FAFC]'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
