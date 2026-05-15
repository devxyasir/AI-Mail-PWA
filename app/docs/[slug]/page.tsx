import React from 'react';
import { notFound } from 'next/navigation';
import { DOC_ARTICLES } from '@/lib/docs/content';
import { DocRenderer } from '@/components/docs/DocRenderer';

export function generateStaticParams() {
  return DOC_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export default async function DocArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = DOC_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="animate-in">
      <header className="mb-fib-55">
        <p className="text-[10px] font-mono font-bold text-secondary uppercase tracking-[0.3em] mb-fib-13">
          Article / {article.category.replace('-', ' ')}
        </p>
        <h1 className="text-4xl lg:text-5xl font-serif font-bold text-primary tracking-tight">
          {article.title}
        </h1>
      </header>

      <DocRenderer blocks={article.content} />

      <footer className="mt-fib-55 pt-fib-34 border-t border-outline-variant/30">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-mono font-bold text-outline-variant uppercase">
            Last Updated: May 15, 2026
          </p>
          <div className="flex gap-fib-13">
            {/* Could add prev/next links here */}
          </div>
        </div>
      </footer>
    </article>
  );
}
