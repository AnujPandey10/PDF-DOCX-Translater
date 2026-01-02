import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import LanguageSelect from './components/LanguageSelect';
import DocumentViewer from './components/DocumentViewer';
import { TranslationState, TranslationStatus, SUPPORTED_LANGUAGES, LanguageOption } from './types';
import { translateDocumentStream } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<TranslationState>({
    file: null,
    filePreviewUrl: null,
    targetLanguage: SUPPORTED_LANGUAGES[0], // English default
    status: TranslationStatus.IDLE,
    translatedContent: null,
    error: null,
  });
  
  const [statusMessage, setStatusMessage] = useState("Translating...");

  const handleFileSelect = (file: File) => {
    // Revoke old URL if exists
    if (state.filePreviewUrl) {
      URL.revokeObjectURL(state.filePreviewUrl);
    }
    
    const url = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      file: file,
      filePreviewUrl: url,
      status: TranslationStatus.IDLE,
      translatedContent: null,
      error: null
    }));
  };

  const handleLanguageChange = (lang: LanguageOption) => {
    setState(prev => ({ ...prev, targetLanguage: lang }));
  };

  const handleTranslate = async () => {
    if (!state.file) return;

    setState(prev => ({ ...prev, status: TranslationStatus.TRANSLATING, error: null, translatedContent: "" }));

    try {
      await translateDocumentStream(
        state.file, 
        state.targetLanguage.name,
        (htmlChunk) => {
            // Update the content as chunks arrive
            setState(prev => ({
                ...prev,
                translatedContent: htmlChunk
            }));
        },
        (status) => setStatusMessage(status)
      );
      
      setState(prev => ({
        ...prev,
        status: TranslationStatus.COMPLETED,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        status: TranslationStatus.ERROR,
        error: error.message || "An unexpected error occurred."
      }));
    }
  };

  const handleReset = () => {
     if (state.filePreviewUrl) {
      URL.revokeObjectURL(state.filePreviewUrl);
    }
    setState({
        file: null,
        filePreviewUrl: null,
        targetLanguage: SUPPORTED_LANGUAGES[0],
        status: TranslationStatus.IDLE,
        translatedContent: null,
        error: null,
    });
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.filePreviewUrl) {
        URL.revokeObjectURL(state.filePreviewUrl);
      }
    };
  }, [state.filePreviewUrl]);

  const hasFile = !!state.file;
  const isTranslating = state.status === TranslationStatus.TRANSLATING;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header />
      
      <main className="flex-1 flex flex-col overflow-hidden max-w-[1920px] mx-auto w-full p-4 gap-4">
        
        {/* Controls Bar */}
        <div className={`transition-all duration-500 ease-in-out ${hasFile ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none absolute'}`}>
            {hasFile && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-file-pdf text-xl"></i>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{state.file?.name}</p>
                            <p className="text-xs text-slate-500">{(state.file?.size || 0) / 1024 < 1000 ? `${Math.round((state.file?.size || 0)/1024)} KB` : `${((state.file?.size || 0)/1024/1024).toFixed(2)} MB`}</p>
                        </div>
                        <button onClick={handleReset} className="ml-2 text-slate-400 hover:text-red-500 transition-colors" title="Remove file">
                            <i className="fa-solid fa-times-circle"></i>
                        </button>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <LanguageSelect 
                            selectedLanguage={state.targetLanguage} 
                            onChange={handleLanguageChange}
                            disabled={isTranslating} 
                        />
                        <button 
                            onClick={handleTranslate}
                            disabled={isTranslating}
                            className={`
                                flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold shadow-md transition-all
                                ${isTranslating 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                                    : 'bg-brand-900 text-white hover:bg-brand-800 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                                }
                            `}
                        >
                            {isTranslating ? (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin"></i> Translating...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-wand-magic-sparkles"></i> Translate Document
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden">
            {!hasFile ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center pb-20">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-brand-900 mb-3">Professional AI Document Translation</h2>
                        <p className="text-slate-500 max-w-md mx-auto">Upload your PDF documents and instantly translate them while preserving their original layout and formatting.</p>
                    </div>
                    <UploadArea onFileSelect={handleFileSelect} />
                </div>
            ) : (
                <div className="h-full animate-fade-in">
                    {state.error && (
                         <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex items-start justify-between">
                            <div className="flex items-center">
                                <i className="fa-solid fa-circle-exclamation text-red-500 mr-3 text-xl"></i>
                                <div>
                                    <h3 className="text-red-800 font-semibold text-sm">Translation Failed</h3>
                                    <p className="text-red-700 text-sm">{state.error}</p>
                                </div>
                            </div>
                            <button onClick={() => setState(prev => ({...prev, error: null}))} className="text-red-400 hover:text-red-600">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                    )}
                    <DocumentViewer 
                        originalUrl={state.filePreviewUrl!} 
                        translatedHtml={state.translatedContent}
                        isLoading={isTranslating}
                        statusMessage={statusMessage}
                    />
                </div>
            )}
        </div>

      </main>
    </div>
  );
};

export default App;
