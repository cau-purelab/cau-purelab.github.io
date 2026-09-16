import React from 'react';
import { Link } from 'react-router-dom';
import { LAB_ADDRESS_QUERY, LAB_EMAIL, LAB_FULL_NAME, LAB_NAME, LAB_SHORT_NAME } from '../constants';
import { LogoMark } from './Logo';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="col-span-1 lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            {/* 내비와 같은 마크를 쓴다 — 예전에는 여기만 원형 PNG였다 */}
                            <LogoMark size={40} />
                            {/* 브랜드 표기는 제목이 아니라 서명이다 — 페이지 아웃라인에 섞이지 않도록 <p>로 둔다 */}
                            <p className="text-2xl font-playfair font-bold text-white tracking-wide">
                                {LAB_SHORT_NAME}
                                <span className="block text-xs font-sans font-semibold tracking-[0.18em] text-slate-300 uppercase mt-1">{LAB_FULL_NAME}</span>
                            </p>
                        </div>
                        <p className="text-sm text-slate-300 max-w-sm leading-relaxed pl-1">
                            We focus on privacy-preserving AI, machine unlearning, and robust engineering for trustworthy systems.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-700 pb-2 inline-block">Navigation</h2>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Home</Link></li>
                            <li><Link to="/research" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Research</Link></li>
                            <li><Link to="/people" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">People</Link></li>
                            <li><Link to="/publications" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Publications</Link></li>
                            <li><Link to="/scholar" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Publication Archive</Link></li>
                            <li><Link to="/news" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">News</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-700 pb-2 inline-block">Contact</h2>
                        <div className="space-y-2 text-sm text-slate-300">
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LAB_ADDRESS_QUERY)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block not-italic hover:text-white transition-colors"
                            >
                                <address className="not-italic">
                                    Room B105-1, Bldg. 310<br />
                                    Chung-Ang University<br />
                                    84 Heukseok-ro, Dongjak-gu<br />
                                    Seoul, 06974, Rep. of Korea
                                </address>
                                <span className="mt-2 inline-block text-xs text-slate-400 underline underline-offset-4">Open in Google Maps</span>
                            </a>
                            <a href={`mailto:${LAB_EMAIL}`} className="block mt-4 text-blue-300 hover:text-blue-200 transition-colors font-medium">{LAB_EMAIL}</a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
                    <p>&copy; {new Date().getFullYear()} {LAB_NAME}. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">Site last updated: {__BUILD_DATE__}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
