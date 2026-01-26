import React from 'react';
import { Mail, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-playfair text-lg font-bold text-blue-900 mb-4">SVIL</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Security Visual Intelligence Lab at Chung-Ang University dedicated to Trustworthy AI and Secure Computer Vision research.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-playfair text-lg font-bold text-blue-900 mb-4">Contact</h3>
                        <div className="space-y-3">
                            <div className="flex items-center text-gray-600 text-sm">
                                <Mail className="h-4 w-4 mr-2" />
                                <span>smrho@cau.ac.kr</span>
                            </div>
                            <div className="flex items-start text-gray-600 text-sm">
                                <MapPin className="h-4 w-4 mr-2 mt-1" />
                                <span>Chung-Ang University, Seoul, Korea</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-playfair text-lg font-bold text-blue-900 mb-4">Links</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="https://www.cau.ac.kr" target="_blank" rel="noreferrer" className="hover:text-blue-900">Chung-Ang University</a></li>
                            <li><a href="#" className="hover:text-blue-900">Department of AI</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
                    &copy; {new Date().getFullYear()} Security Visual Intelligence Lab. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;