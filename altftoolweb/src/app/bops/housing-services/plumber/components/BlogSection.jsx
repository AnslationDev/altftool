import { useState } from 'react';
import { ArrowRight, CalendarDays, Clock, X } from 'lucide-react';
import '../styles/BlogSection.css';

const posts = [
  {
    title: 'What To Do When a Pipe Bursts',
    category: 'Emergency',
    date: 'May 31, 2026',
    readTime: '5 min read',
    image: 'https://www.mcgillplumbing.com/_next/image?url=%2Fcdn--media%2Fistock_1074493878.1_.2408291530208_jg6wlxdjljqp9uot4iqfk-454x303.jpg&w=1080&q=75&dpl=dpl_BJzBWJgBEkN6WsvYWstUHQ7u2hjg',
    excerpt: 'A burst pipe can damage floors, walls, and cabinets quickly. These first steps help reduce damage before your plumber arrives.',
    body: [
      'The first move is to shut off the main water supply. Most homes have a main valve near the meter, basement, garage, or utility room. Turning it off stops the pressure feeding the broken pipe.',
      'Next, open a nearby faucet to release pressure from the line. Move rugs, furniture, boxes, and electrical items away from the wet area. If water is near outlets or appliances, avoid touching them and turn off power to that area when it is safe.',
      'After the immediate damage is controlled, call a licensed plumber. A good repair visit should include finding the break, checking nearby pipe condition, explaining repair options, and testing the line before the technician leaves.',
    ],
  },
  {
    title: 'Why Your Drain Keeps Clogging',
    category: 'Drain Care',
    date: 'June 02, 2026',
    readTime: '4 min read',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnrTJgD0blrx2ZcLE1r8HO2HO9GYh5eO1WdQ&s',
    excerpt: 'If the same drain blocks again and again, the real problem is usually deeper than the visible opening or trap.',
    body: [
      'Repeat drain clogs usually come from grease buildup, soap residue, hair, scale, or roots inside the pipe. A quick snake may punch a small hole through the blockage, but it may not clean the pipe wall.',
      'Camera inspection helps confirm what is happening inside the line. If the pipe is packed with buildup, hydro jetting can wash the full pipe wall and restore stronger flow.',
      'You can reduce future issues by avoiding grease in kitchen drains, using strainers in showers, and booking service when a drain slows down instead of waiting for a full backup.',
    ],
  },
  {
    title: 'Repair or Replace Your Water Heater?',
    category: 'Water Heater',
    date: 'June 08, 2026',
    readTime: '6 min read',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgjcg786VaF827JJ6Zgsss4zHKouLnYtETCg&s',
    excerpt: 'Age, water temperature, tank condition, and repair cost all decide whether a heater fix is worth it.',
    body: [
      'A younger water heater with a simple part failure is often worth repairing. Common repairable issues include a bad thermostat, heating element, pilot assembly, or pressure relief valve.',
      'Replacement becomes smarter when the tank is old, leaking, heavily rusted, or no longer meeting your hot water demand. A leaking tank usually cannot be patched in a dependable way.',
      'Before choosing, compare the repair cost, age of the unit, warranty, household usage, and efficiency. A plumber should explain both options clearly before starting work.',
    ],
  },
];

const imageSrc = (image) => (typeof image === 'string' ? image : image.src);

export default function BlogSection() {
  const [activePost, setActivePost] = useState(null);

  return (
    <section className="fp-blog" id="blog">
      <div className="fp-blog__inner">
        <div className="fp-blog__header">
          <h2 className="fp-blog__title">Blog</h2>
          <p className="fp-blog__sub">
            Quick plumbing guides for leaks, drains, and water heaters. Read the short preview, then open the full article when you need details.
          </p>
        </div>

        <div className="fp-blog__grid">
          {posts.map((post) => (
            <article className="fp-blog__card" key={post.title}>
              <div className="fp-blog__image">
                <img src={imageSrc(post.image)} alt={post.title} loading="lazy" />
              </div>
              <div className="fp-blog__content">
                <div className="fp-blog__meta">
                  <span><CalendarDays size={12} /> {post.date}</span>
                  <span>{post.category}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <button type="button" className="fp-blog__read" onClick={() => setActivePost(post)}>
                  Read More <ArrowRight size={13} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activePost && (
        <div className="fp-blog-modal" role="presentation" onClick={() => setActivePost(null)}>
          <article
            className="fp-blog-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fp-blog-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="fp-blog-modal__close" onClick={() => setActivePost(null)} aria-label="Close blog">
              <X size={18} />
            </button>
            <div className="fp-blog-modal__image">
              <img src={imageSrc(activePost.image)} alt={activePost.title} />
            </div>
            <div className="fp-blog-modal__body">
              <div className="fp-blog-modal__meta">
                <span><CalendarDays size={14} /> {activePost.date}</span>
                <span><Clock size={14} /> {activePost.readTime}</span>
                <span>{activePost.category}</span>
              </div>
              <h3 id="fp-blog-modal-title">{activePost.title}</h3>
              {activePost.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
