import React from 'react';
import { NEWS } from '../constants';
import { Calendar, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const News = () => {
    const newsByYear = NEWS.reduce((acc, item) => {
        const year = item.date.split('.')[0];
        if (!acc[year]) acc[year] = [];
        acc[year].push(item);
        return acc;
    }, {} as Record<string, typeof NEWS>);

    const sortedYears = Object.keys(newsByYear).sort((a, b) => Number(b) - Number(a));

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <SEO title="News" description="Latest news and announcements from PURE." />

            <div className="mb-16">
                <h1 className="font-playfair text-4xl font-bold text-blue-900 mb-4">Lab News</h1>
                <p className="text-gray-600">Recent activities, achievements, and announcements</p>
            </div>

            <div className="space-y-16">
                {sortedYears.map((year) => (
                    <div key={year} className="animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-3xl font-playfair font-bold text-blue-900/20">{year}</span>
                            <div className="h-px bg-gray-200 flex-grow"></div>
                        </div>

                        <div className="grid gap-6">
                            {newsByYear[year].map((item) => (
                                <div
                                    key={item.id}
                                    className="group bg-white p-6 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-4 md:items-center"
                                >
                                    <div className="flex items-center text-blue-600 font-bold min-w-[140px] text-sm shrink-0">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span>{item.date}</span>
                                    </div>

                                    <div className="flex-grow">
                                        <h3 className="text-gray-800 font-medium text-lg group-hover:text-blue-900 transition-colors leading-snug">
                                            {item.title}
                                        </h3>
                                    </div>

                                    <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
                                        <ArrowRight className="h-5 w-5 text-blue-200" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default News;
