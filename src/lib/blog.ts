type BlogPost = {
  slug: string;
  markdown: string;
  title: string;
  description: string;
  frontmatter: Record<string, string | string[] | undefined>;
};

const blogPosts: BlogPost[] = [];

function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

function getBlogRoute(slug: string) {
  return `/blog/${slug}/`.replace(/\/+/g, '/');
}

export { blogPosts, getBlogPost, getBlogRoute };
export type { BlogPost };
