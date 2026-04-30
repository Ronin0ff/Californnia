import { useParams, Link, Navigate } from 'react-router-dom';
import { getBlogPost, getBlogRoute } from '@/lib/blog';
import BlogArticleLayout from '@/components/blog/BlogArticleLayout';
import MarkdownArticle from '@/components/blog/MarkdownArticle';
import { ArrowLeft, TrendingUp, BookOpen } from 'lucide-react';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog/" replace />;
  }

  const { frontmatter } = post;

  return (
    <BlogArticleLayout
      seoMeta={{
        title: frontmatter.title ?? post.title,
        description: frontmatter.description ?? post.description,
        ogImage: frontmatter.ogImage,
        canonicalUrl: frontmatter.canonicalUrl,
      }}
    >
      <main className="min-h-screen bg-slate-50 text-slate-900">
        {/* Header matching app style */}
        <header className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-6 py-6 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">MP Аналитик</span>
            <span className="text-slate-400 mx-2">/</span>
            <Link
              to="/blog/"
              className="text-slate-600 font-medium flex items-center gap-2 hover:text-blue-700 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Блог
            </Link>
            <span className="text-slate-400 mx-2">/</span>
            <span className="text-slate-500 truncate max-w-xs">{post.title}</span>
          </div>
        </header>

        <article className="mx-auto max-w-3xl px-6 py-12">
          {/* Back link */}
          <Link
            to="/blog/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Все статьи
          </Link>

          {/* Post header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mb-4">
              {frontmatter.date && (
                <span className="text-slate-400">{frontmatter.date}</span>
              )}
              {frontmatter.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-700"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl leading-tight">
              {post.title}
            </h1>
            {post.description && (
              <p className="mt-4 text-lg text-slate-600 leading-8">
                {post.description}
              </p>
            )}
          </header>

          {/* Post content */}
          <div className="border-t border-slate-200 pt-8">
            <MarkdownArticle markdown={post.markdown} />
          </div>

          {/* Bottom navigation */}
          <div className="mt-16 pt-8 border-t border-slate-200">
            <Link
              to="/blog/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Вернуться к списку статей
            </Link>
          </div>
        </article>
      </main>
    </BlogArticleLayout>
  );
};

export default BlogPostPage;