import { Link } from 'react-router-dom';
import { blogPosts, getBlogRoute } from '@/lib/blog';
import { BookOpen, ArrowRight, TrendingUp } from 'lucide-react';

const BlogIndexPage = () => (
  <main className="min-h-screen bg-slate-50 text-slate-900">
    {/* Header matching app style */}
    <header className="bg-white border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-6 py-6 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg text-slate-900">MP Аналитик</span>
        <span className="text-slate-400 mx-2">/</span>
        <span className="text-slate-600 font-medium flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Блог
        </span>
      </div>
    </header>

    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="max-w-3xl space-y-4 mb-12">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Блог о юнит-экономике маркетплейсов
        </h1>
        <p className="text-lg text-slate-600 leading-8">
          Статьи, руководства и кейсы для продавцов на Wildberries и Ozon.
          Узнайте, как рассчитать чистую прибыль, оптимизировать цены и выявить убыточные SKU.
        </p>
      </div>

      <div className="grid gap-5">
        {blogPosts.length > 0 ? (
          blogPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                {post.frontmatter.date ? (
                  <span className="text-slate-400">{post.frontmatter.date}</span>
                ) : null}
                {post.frontmatter.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">
                <Link className="hover:text-blue-700 transition-colors" to={getBlogRoute(post.slug)}>
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-base leading-7 text-slate-600 line-clamp-2">
                {post.description}
              </p>
              <Link
                to={getBlogRoute(post.slug)}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors"
              >
                Читать статью
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))
        ) : (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900">Статьи скоро появятся</h2>
            <p className="mt-2 max-w-lg mx-auto text-slate-600">
              Мы готовим полезные материалы о юнит-экономике, оптимизации цен и работе с маркетплейсами.
            </p>
          </section>
        )}
      </div>
    </section>
  </main>
);

export default BlogIndexPage;