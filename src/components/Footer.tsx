import React from 'react';
import { Link } from 'react-router-dom'; // [추가] Link 컴포넌트 임포트
import { LAB_NAME } from '../constants';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 lg:col-span-2">
                        <h2 className="text-2xl font-playfair font-bold text-white mb-4">{LAB_NAME}</h2>
                        <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                            We focus on fundamental and applied research in computer vision, machine learning security, and trustworthy AI systems.
                        </p>
                    </div>

                    {/* Links - [수정됨] a 태그 -> Link 컴포넌트 */}
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navigation</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/research" className="hover:text-white transition-colors">Research</Link></li>
                            <li><Link to="/people" className="hover:text-white transition-colors">People</Link></li>
                            <li><Link to="/publications" className="hover:text-white transition-colors">Publications</Link></li>
                            <li><Link to="/news" className="hover:text-white transition-colors">News</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact</h3>
                        <div className="space-y-2 text-sm text-slate-400">
                            <p>Room B105-1, Bldg. 310</p>
                            <p>Chung-Ang University</p>
                            <p>84 Heukseok-ro, Dongjak-gu</p>
                            <p>Seoul, 06974, Rep. of Korea</p>
                            <a href="mailto:smrho@cau.ac.kr" className="block mt-4 text-blue-400 hover:text-blue-300">smrho@cau.ac.kr</a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} {LAB_NAME}. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">Built with React & Vite</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;