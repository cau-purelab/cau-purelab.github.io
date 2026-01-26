import React from 'react';
import { MEMBERS } from '../constants';
import { Mail, Globe } from 'lucide-react';

const People = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="font-playfair text-4xl font-bold text-blue-900 mb-4">Our Team</h1>
        <p className="text-gray-600">Meet the researchers behind our innovations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MEMBERS.map((member, idx) => (
          <div key={idx} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="aspect-square overflow-hidden bg-gray-100">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="font-playfair text-xl font-bold text-blue-900 mb-1">{member.name}</h3>
              <p className="text-sm font-medium text-blue-600 mb-4">{member.role}</p>

              <div className="space-y-2">
                <a href={`mailto:${member.email}`} className="flex items-center text-sm text-gray-600 hover:text-blue-900">
                  <Mail className="h-4 w-4 mr-2" />
                  {member.email}
                </a>
                {member.website && (
                  <a href={member.website} target="_blank" rel="noreferrer" className="flex items-center text-sm text-gray-600 hover:text-blue-900">
                    <Globe className="h-4 w-4 mr-2" />
                    Personal Website
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default People;