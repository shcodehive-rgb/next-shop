import { Metadata } from 'next';
import Link from 'next/link';
import { useShop } from "@/context/ShopContext";
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Blog - Latest Articles & Tips',
  description: 'Discover our latest articles, product guides, and helpful tips to make the most of your shopping experience.',
  keywords: 'blog, articles, guides, shopping tips, product reviews',
  openGraph: {
    title: 'Blog - Latest Articles & Tips',
    description: 'Discover our latest articles, product guides, and helpful tips.',
    type: 'website',
  },
};

export default function BlogPage() {
  const { blogs } = useShop();
  const publishedBlogs = blogs.filter(blog => blog.status === 'published');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Blog
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 mb-8">
              Discover tips, guides, and stories to enhance your shopping experience
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Calendar className="w-4 h-4" />
                Updated Weekly
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <User className="w-4 h-4" />
                Expert Writers
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4" />
                Quick Reads
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedBlogs.map((blog) => (
            <article 
              key={blog.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative aspect-[16/9] bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden">
                {blog.thumbnail ? (
                  <img 
                    src={blog.thumbnail} 
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center mb-2 mx-auto">
                        <span className="text-emerald-600 text-2xl font-bold">📝</span>
                      </div>
                      <p className="text-emerald-600 text-sm font-medium">Blog Image</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {blog.publishDate}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>{blog.publishDate}</span>
                  <span>•</span>
                  <span>{blog.author}</span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {blog.title}
                </h2>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {blog.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-600">{blog.author}</span>
                  </div>
                  
                  <Link 
                    href={`/blog/${blog.slug}`}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Load More Articles
          </button>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-emerald-50 border-t border-emerald-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Updated
            </h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter for the latest articles, exclusive tips, and special offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
