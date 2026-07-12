import React from 'react';
import { Link } from 'react-router-dom';
import { LAB_EMAIL, LAB_FULL_NAME, LAB_NAME, LAB_SHORT_NAME } from '../constants';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="col-span-1 lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            {/* [수정됨] PURE 마크 사용 */}
                            <img src="/assets/favicon.png" alt={`${LAB_SHORT_NAME} Mark`} loading="lazy" className="h-10 w-10 opacity-90" />
                            <h2 className="text-2xl font-playfair font-bold text-white tracking-wide">
                                {LAB_SHORT_NAME}
                                <span className="block text-xs font-sans font-semibold tracking-[0.18em] text-slate-400 uppercase mt-1">{LAB_FULL_NAME}</span>
                            </h2>
                        </div>
                        <p className="text-sm text-slate-400 max-w-sm leading-relaxed pl-1">
                            We focus on privacy-preserving AI, machine unlearning, and robust engineering for trustworthy systems.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-700 pb-2 inline-block">Navigation</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Home</Link></li>
                            <li><Link to="/research" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Research</Link></li>
                            <li><Link to="/people" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">People</Link></li>
                            <li><Link to="/publications" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Publications</Link></li>
                            <li><Link to="/scholar" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Scholar</Link></li>
                            <li><Link to="/news" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">News</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-700 pb-2 inline-block">Contact</h3>
                        <div className="space-y-2 text-sm text-slate-400">
                            <p>Room B105-1, Bldg. 310</p>
                            <p>Chung-Ang University</p>
                            <p>84 Heukseok-ro, Dongjak-gu</p>
                            <p>Seoul, 06974, Rep. of Korea</p>
                            <a href={`mailto:${LAB_EMAIL}`} className="block mt-4 text-blue-400 hover:text-blue-300 transition-colors font-medium">{LAB_EMAIL}</a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} {LAB_NAME}. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">Site last updated: {__BUILD_DATE__}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
