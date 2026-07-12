import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
      <SEO title="Page Not Found" description="The page you are looking for does not exist." />

      <p className="text-8xl font-playfair font-extrabold text-blue-900/15 mb-4">404</p>
      <h1 className="font-playfair text-3xl font-bold text-slate-900 mb-3">Page Not Found</h1>
      <p className="text-slate-500 mb-10">
        The page you are looking for doesn't exist or may have been moved.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg"
        >
          <Home size={16} /> Back to Home
        </Link>
        <Link
          to="/scholar"
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
        >
          <Search size={16} /> Browse Publications
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
