import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-900 text-white shadow-lg z-50 relative">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-brand-900 text-xl font-bold shadow-sm">
            <i className="fa-solid fa-language"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">LinguaDoc AI</h1>
            <p className="text-xs text-brand-100 opacity-80 font-medium">Professional Document Translation</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-brand-100 hover:text-white transition-colors">Documentation</a>
            <div className="h-8 w-px bg-brand-800"></div>
            <div className="flex items-center gap-2 text-xs text-brand-100 bg-brand-800 px-3 py-1.5 rounded-full">
                <i className="fa-solid fa-bolt text-yellow-400"></i>
                <span>Powered by Gemini 3.0</span>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
