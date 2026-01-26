import React from 'react';
import { PUBLICATIONS } from '../constants';
import { FileText, Calendar, Tag } from 'lucide-react';

const Publications = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="font-playfair text-4xl font-bold text-blue-900 mb-4">Publications</h1>
        <p className="text-gray-600">Selected research papers and conference proceedings</p>
      </div>

      <div className="space-y-6">
        {PUBLICATIONS.map((pub) => (
          <div key={pub.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                {pub.title}
              </h3>
              <div className="text-gray-600 font-medium">
                {pub.authors.join(", ")}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center text-blue-900 font-medium">
                  <FileText className="h-4 w-4 mr-1" />
                  {pub.venue}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {pub.year}
                </div>
                {pub.tags && (
                  <div className="flex items-center gap-2">
                    {pub.tags.map(tag => (
                      <span key={tag} className="flex items-center bg-gray-100 px-2 py-0.5 rounded text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Publications;