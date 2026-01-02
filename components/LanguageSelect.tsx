import React from 'react';
import { SUPPORTED_LANGUAGES, LanguageOption } from '../types';

interface LanguageSelectProps {
  selectedLanguage: LanguageOption;
  onChange: (lang: LanguageOption) => void;
  disabled?: boolean;
}

const LanguageSelect: React.FC<LanguageSelectProps> = ({ selectedLanguage, onChange, disabled }) => {
  return (
    <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Translate to:</label>
        <div className="relative group min-w-[200px]">
            <select
                value={selectedLanguage.code}
                onChange={(e) => {
                    const lang = SUPPORTED_LANGUAGES.find(l => l.code === e.target.value);
                    if (lang) onChange(lang);
                }}
                disabled={disabled}
                className="w-full appearance-none bg-white border border-slate-300 text-slate-700 py-2.5 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed font-medium transition-all hover:border-brand-300"
            >
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500 group-hover:text-brand-600 transition-colors">
                <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
        </div>
    </div>
  );
};

export default LanguageSelect;
