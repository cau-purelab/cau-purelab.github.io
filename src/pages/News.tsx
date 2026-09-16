import React from 'react';
import { NEWS } from '../constants';
import { ArrowUpRight, Calendar } from 'lucide-react';
import SEO from '../components/SEO';
import PageHeader from '../components/PageHeader';

const News = () => {
    // 배열의 삽입 순서를 신뢰하지 않고 렌더 시점에 날짜 내림차순으로 정렬한다 (감사 20번).
    // constants.tsx 배열 끝에 새 항목을 추가해도 최신 소식이 맨 위에 오도록 보장한다.
    const sortedNews = [...NEWS].sort((a, b) => b.date.localeCompare(a.date));

    const newsByYear = sortedNews.reduce((acc, item) => {
        const year = item.date.split('.')[0];
        if (!acc[year]) acc[year] = [];
        acc[year].push(item);
        return acc;
    }, {} as Record<string, typeof NEWS>);

    const sortedYears = Object.keys(newsByYear).sort((a, b) => Number(b) - Number(a));

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <SEO title="News" description="Latest news and announcements from PURE." />

            <PageHeader
                eyebrow="Updates"
                title="Lab News"
                description="Recent activities, achievements, and announcements"
            />

            <div className="space-y-16">
                {sortedYears.map((year) => (
                    <section key={year} aria-labelledby={`news-year-${year}`} className="animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 id={`news-year-${year}`} className="text-3xl font-playfair font-bold text-blue-900/70">{year}</h2>
                            <div className="h-px bg-slate-200 flex-grow"></div>
                        </div>

                        {/* 목적지가 있는 항목(item.link)만 앵커가 된다 — 나머지에는 hover 색 변화나
                            슬라이드 화살표 같은 가짜 어포던스를 두지 않는다.
                            id는 RSS 항목 링크(/news#<id>)의 앵커다. scripts/site.cjs·create-rss.cjs와 같은 값을 쓴다. */}
                        <ul className="grid gap-6">
                            {newsByYear[year].map((item) => (
                                <li
                                    key={item.id}
                                    id={item.id}
                                    className="bg-white p-6 rounded-xl border border-slate-100 flex flex-col md:flex-row gap-4 md:items-center"
                                >
                                    <div className="flex items-center text-blue-700 font-bold min-w-[140px] text-sm shrink-0">
                                        <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
                                        <span>{item.date}</span>
                                    </div>

                                    <div className="flex-grow">
                                        <h3 className="text-slate-800 font-medium text-lg leading-snug">
                                            {/* TODO(lab): 학회 후기·공지·논문 원문 주소가 있으면 constants.tsx의
                                                해당 NEWS 항목에 link를 채운다. 없는 주소를 지어내지 말 것. */}
                                            {item.link ? (
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label={`${item.title} (opens in a new tab)`}
                                                    className="group inline-flex items-start gap-1.5 hover:text-blue-800 transition-colors"
                                                >
                                                    <span className="underline decoration-slate-300 underline-offset-4 group-hover:decoration-blue-400">
                                                        {item.title}
                                                    </span>
                                                    <ArrowUpRight className="h-4 w-4 mt-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                                                </a>
                                            ) : (
                                                item.title
                                            )}
                                        </h3>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default News;
