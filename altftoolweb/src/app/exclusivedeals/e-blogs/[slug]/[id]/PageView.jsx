"use client"
import { usePathname } from 'next/navigation'
import React, { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, User, Tag, Share2, Facebook, Twitter, Linkedin, Clock, BookOpen } from 'lucide-react'
import blogData from "../../../(data)/db.json"

function BlogDetailPage() {
    const path = usePathname()

    const { category, slug } = useMemo(() => {
        const segment = path.split("/").filter(Boolean)
        return {
            category: segment.slice(2, 3)[0] || '',
            slug: segment.slice(3)[0] || ''
        }
    }, [path])

    const blogDetail = useMemo(() =>
        blogData.blog?.find((content) =>
            content.category.toLowerCase() === category.toLowerCase() &&
            content.slug.toLowerCase() === slug.toLowerCase()
        ), [category, slug]
    )

    // Related posts based on category
    const relatedPosts = useMemo(() =>
        blogData.blog?.filter((content) =>
            content.category.toLowerCase() === category.toLowerCase() &&
            content.slug.toLowerCase() !== slug.toLowerCase()
        ).slice(0, 3) || [], [category, slug]
    )

    if (!blogDetail) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-(--dealspage-background)">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-(--foreground) mb-4">Blog Post Not Found</h2>
                    <p className="text-(--muted-foreground) mb-6">The article you&apos;re looking for doesn&apos;t exist.</p>
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-lg hover:bg-(--primary-hover) transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>
                </div>
            </div>
        )
    }

    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    const shareTitle = encodeURIComponent(blogDetail.heading)

    return (
        <div className="min-h-screen bg-(--dealspage-background)">
            {/* Header Navigation */}

            {/* Hero Section */}
            <article className="bg-(--card)">
            <div className='py-2 px-4' >
                    <Link className='' href={"/exclusivedeals"} >Back</Link>
                    </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


                    {/* Category Badge */}
                    <div className="mb-6">
                        <span className="inline-block px-4 py-1.5 bg-(--primary) text-(--primary-foreground) rounded-full text-sm font-semibold shadow-md">
                            {blogDetail.category}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-(--foreground) mb-6 leading-tight">
                        {blogDetail.heading}
                    </h1>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-6 text-(--muted-foreground) mb-8 pb-8 border-b border-(--border)">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-(--primary) flex items-center justify-center text-(--primary-foreground) font-bold">
                                {blogDetail.author.charAt(0)}
                            </div>
                            <span className="font-medium text-(--foreground)">{blogDetail.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span>{blogDetail.readTime}</span>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden mb-12 shadow-2xl">
                        <Image
                            src={blogDetail.image}
                            alt={blogDetail.heading}
                            fill
                            sizes="(max-width: 1280px) 100vw, 1280px"
                            className="object-cover hover:scale-105 transition-transform duration-700"
                            priority
                        />
                    </div>

                    {/* Article Introduction */}
                    <div className="mb-12">
                        <p className="text-xl text-(--foreground) leading-relaxed font-light">
                            {blogDetail.description}
                        </p>
                    </div>

                    {/* Table of Contents (if content exists) */}
                    {blogDetail.content && blogDetail.content.sections && (
                        <div className="bg-(--primary-soft) border-l-4 border-(--primary) rounded-lg p-6 mb-12">
                            <div className="flex items-center gap-2 mb-4">
                                <BookOpen className="w-5 h-5 text-(--primary)" />
                                <h2 className="text-lg font-bold text-(--foreground)">Table of Contents</h2>
                            </div>
                            <ul className="space-y-2">
                                {blogDetail.content.sections.map((section, index) => (
                                    <li key={index}>
                                        <a
                                            href={`#section-${index}`}
                                            className="text-(--primary) hover:text-(--primary-hover) hover:underline transition-colors"
                                        >
                                            {section.heading}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Main Content */}
                    {blogDetail.content && (
                        <div className="prose prose-lg max-w-none mb-12">
                            {/* Introduction */}
                            {blogDetail.content.introduction && (
                                <p className="text-(--foreground) leading-relaxed mb-10 text-lg first-letter:text-5xl first-letter:font-bold first-letter:text-(--primary) first-letter:mr-1 first-letter:float-left">
                                    {blogDetail.content.introduction}
                                </p>
                            )}

                            {/* Content Sections */}
                            {blogDetail.content.sections && blogDetail.content.sections.map((section, index) => (
                                <div key={index} id={`section-${index}`} className="mb-10 scroll-mt-20">
                                    <h2 className="text-3xl font-bold text-(--foreground) mb-4 flex items-start gap-3">
                                        <span className="inline-block w-8 h-8 rounded-full bg-(--primary) text-(--primary-foreground) text-sm flex items-center justify-center flex-shrink-0 mt-1">
                                            {index + 1}
                                        </span>
                                        {section.heading}
                                    </h2>
                                    <p className="text-(--foreground) leading-relaxed text-lg mb-6">
                                        {section.content}
                                    </p>
                                </div>
                            ))}

                            {/* Conclusion */}
                            {blogDetail.content.conclusion && (
                                <div className="bg-(--primary-soft) rounded-2xl p-8 mt-12">
                                    <h2 className="text-2xl font-bold text-(--foreground) mb-4 flex items-center gap-2">
                                        <span className="text-3xl">💡</span>
                                        Final Thoughts
                                    </h2>
                                    <p className="text-(--foreground) leading-relaxed text-lg">
                                        {blogDetail.content.conclusion}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-3 mb-8 pb-8 border-b border-(--border)">
                        <Tag className="w-5 h-5 text-(--muted-foreground)" />
                        {blogDetail.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 bg-(--surface-soft) text-(--muted-foreground) rounded-full text-sm font-medium hover:bg-(--primary-soft) hover:text-(--primary) transition-all cursor-pointer shadow-sm"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Share Section */}
                    {/* <div className="bg-(--surface-soft) rounded-2xl p-6 mb-12">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Share2 className="w-6 h-6 text-(--muted-foreground)" />
                                <span className="text-(--foreground) font-semibold text-lg">
                                    Share this article
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-full bg-(--primary) text-(--primary-foreground) hover:bg-(--primary-hover) transition-colors shadow-md hover:shadow-lg"
                                    aria-label="Share on Facebook"
                                >
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-full bg-(--secondary) text-(--secondary-foreground) hover:bg-(--primary-hover) transition-colors shadow-md hover:shadow-lg"
                                    aria-label="Share on Twitter"
                                >
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-full bg-(--primary) text-(--primary-foreground) hover:bg-(--primary-hover) transition-colors shadow-md hover:shadow-lg"
                                    aria-label="Share on LinkedIn"
                                >
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div> */}

                    {/* Author Card */}
                    <div className="bg-(--primary-soft) rounded-2xl p-6 sm:p-8 mb-12 border border-(--border)">
                        <div className="flex items-start gap-4">
                            <div className="w-20 h-20 rounded-full bg-(--primary) flex items-center justify-center text-(--primary-foreground) text-2xl font-bold flex-shrink-0 shadow-lg">
                                {blogDetail.author.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="mb-2">
                                    <h3 className="text-xl font-bold text-(--foreground) mb-1">
                                        Written by {blogDetail.author}
                                    </h3>
                                    <p className="text-sm text-(--muted-foreground)">Content Creator & Industry Expert</p>
                                </div>
                                <p className="text-(--foreground) leading-relaxed">
                                    Passionate about exploring trends, sharing insights, and helping readers make informed decisions.
                                    With years of experience in {blogDetail.category.toLowerCase()}, I strive to deliver valuable content
                                    that empowers and inspires.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter Signup */}

                </div>
            </article>

            {/* Related Posts Section */}
            {relatedPosts.length > 0 && (
                <section className="bg-(--card) py-16 border-t border-(--border)">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-(--foreground)">Related Articles</h2>
                            <Link
                                href="/blogs"
                                className="text-(--primary) hover:text-(--primary-hover) font-medium flex items-center gap-2 group"
                            >
                                View All
                                <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={post.link}
                                    className="group"
                                >
                                    <div className="bg-(--surface-soft) rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                        <div className="relative h-56 overflow-hidden">
                                            <Image
                                                src={post.image}
                                                alt={post.heading}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 380px"
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-(--card)/90 backdrop-blur-sm text-(--foreground) rounded-full text-xs font-semibold">
                                                    {post.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="text-xl font-bold text-(--foreground) mb-3 group-hover:text-(--primary) transition-colors line-clamp-2">
                                                {post.heading}
                                            </h3>
                                            <p className="text-(--muted-foreground) text-sm line-clamp-2 mb-4 flex-1">
                                                {post.description}
                                            </p>
                                            <div className="flex items-center justify-between text-sm text-(--muted-foreground) pt-4 border-t border-(--border)">
                                                <span className="font-medium">{post.author}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}

export default BlogDetailPage
